import type { Writable } from "svelte/store";
import type { Channel } from "phoenix";
import type {
  TrackStore,
  TransportStore,
  ClipInfo,
  ClipID,
  Track,
  Clip,
  TrackID,
  ClipInput,
  NewClip,
  User,
  Token,
} from "./types";
import { writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc, clipsToClipInfos } from "../utils";
import * as Tone from "tone";
import { GrainPlayer, Draw, Time } from "tone";
import channels from "./channels";
import transportStore from "./transport";
import { ChannelName, PlayState } from "./types"

let sessionStoreValue: TrackStore;
let transport: TransportStore;
let sharedChannel: Channel | null;
let privateChannel: Channel | null;

const trackStore: Writable<TrackStore> = writable({});
const { subscribe, update } = trackStore;

trackStore.subscribe((value) => {
  sessionStoreValue = value;
});

channels.subscribe((value) => {
  sharedChannel = value.shared;
  privateChannel = value.private;
});

transportStore.subscribe((value: TransportStore) => {
  transport = value;
});

// ----------------- PLAY ----------------------------
function playClips(clips: Clip[]) {
  const clipInfos = clipsToClipInfos(clips);
  drawQueueClips(clipInfos);
  pushPlayClip(clipInfos);
}

function pushPlayClip(trackClips: ClipInfo[]) {
  sharedChannel?.push("play_clip", trackClips);
}

function playVisual({
  clipId,
  playEvent,
  track,
}: {
  clipId: ClipID;
  playEvent: number;
  track: Track;
}) {
  update((store) => {
    // if there is a clip playing for this track, set it to `stopped`
    if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
      store[track.id].clips[track.currentlyPlaying].state = PlayState.Stopped;
    }

    // set the target clip to a playing state
    store[track.id].clips[clipId].state = PlayState.Playing;
    store[track.id].currentlyPlaying = clipId;
    store[track.id].playEvent = playEvent;
    return store;
  });
}

function drawQueueClips(playClips: ClipInfo[]) {
  Draw.schedule(() => {
    update((store) => {
      playClips.forEach((clip) => {
        store[clip.trackId].clips[clip.id].state = PlayState.Queued;
      });
      return store;
    });
  }, Tone.now());
}

function receivePlayClips({
  waitMilliseconds,
  clips,
}: {
  waitMilliseconds: number;
  clips: ClipInfo[];
}) {
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
  const nextBarTT = quantizedTransportTime("@1m");
  const fireAt = transport.state === PlayState.Playing ? nextBarTT : 0;
  transport.state === PlayState.Playing && drawQueueClips(clips);
  console.log(`START NOW: ${transport.transport.seconds}`);
  console.log(`Starting at: ${nextBarTT}`);
  transportStore.start(nowWithLatencyCompensation);

  clips.forEach((clip: ClipInfo) => {
    const track = sessionStoreValue[clip.trackId];
    // cancel currently playing clip events for the track
    track.playEvent !== null && transport.transport.clear(track.playEvent);

    const playEvent = loopClip({
      clip: track.clips[clip.id],
      startTime: fireAt,
      endTime: "+1m",
      every: "1m",
    });

    once(
      (time) => {
        const now = transport.transport.seconds;
        console.log(`start callback invoked at ${now}`);
        stopGrainPlayer({ track, time });
        drawPlayClip({ clipId: clip.id, playEvent, track, time });
      },
      { at: fireAt },
    );
  });
}

function drawPlayClip({
  clipId,
  playEvent,
  track,
  time,
}: {
  clipId: ClipID;
  playEvent: number;
  track: Track;
  time: number;
}) {
  Draw.schedule(() => playVisual({ clipId, playEvent, track }), time);
}

function loopClip({
  clip,
  endTime,
  every,
  startTime,
}: {
  clip: Clip;
  endTime: string;
  every: string;
  startTime: number;
}) {
  return transport.transport.scheduleRepeat(
    (audioContextTime: number) => {
      clip.grainPlayer.start(audioContextTime).stop(endTime);
    },
    every,
    startTime,
  );
}

// ----------------- STOP ----------------------------
function stopClips(trackIds: TrackID[]) {
  sharedChannel?.push("stop_clip", { trackIds });
}

function receiveStopClip({ trackIds }: { trackIds: TrackID[] }) {
  const nextBarTT = quantizedTransportTime("@1m");
  console.log(`STOP NOW: ${transport.transport.seconds}`);
  console.log(`Stopping at: ${nextBarTT}`);

  for (const trackId of trackIds) {
    const track = sessionStoreValue[trackId];
    track.playEvent !== null && transport.transport.clear(track.playEvent);
    once(
      (time: number) => {
        const now = transport.transport.seconds;
        console.log(`stop callback invoked at ${now}`);
        stopGrainPlayer({ track, time });
        drawStopClip({ track, time });
      },
      { at: nextBarTT },
    );
  }
}

function stopGrainPlayer({ track, time }: { track: Track; time: number }) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].grainPlayer.stop(time);
}

function stopVisual({ track }: { track: Track }) {
  update((store) => {
    for (const clip of Object.values(track.clips)) {
      clip.state = PlayState.Stopped;
    }
    track.currentlyPlaying = null;
    track.playEvent = null;
    return store;
  });
}

function drawStopClip({ track, time }: { track: Track; time: number }) {
  Draw.schedule(() => stopVisual({ track }), time);
}

// ----------------- NEW TRACK ----------------------------
async function addTrack() {
  await Tone.start();
  console.log("tone has started");
  sharedChannel?.push("new_track", {
    id: crypto.randomUUID(),
  });
}

function receiveNewTrack({ id }: { id: TrackID }) {
  update((store) => {
    const newTrack = {
      [id]: { id: id, currentlyPlaying: null, playEvent: null, clips: {} },
    };
    return {
      ...store,
      ...newTrack,
    };
  });
}

// ----------------- NEW CLIP ----------------------------
async function addClip({
  id = crypto.randomUUID(),
  file,
  trackId,
  bpm,
}: ClipInput) {
  const data = await fileToB64(file);
  sharedChannel?.push("new_clip", {
    id: id,
    name: file.name,
    data: data,
    type: file.type,
    trackId: trackId,
    state: "stopped",
    currentTime: 0.0,
    playbackRate: 1,
    bpm,
  });
}

function receiveNewClip({ id, trackId, data, type, ...rest }: NewClip) {
  const url = b64ToAudioSrc(data, type);
  const grainPlayer = new GrainPlayer(url).toDestination();
  grainPlayer.grainSize = 0.2;
  grainPlayer.overlap = 0.05;
  grainPlayer.playbackRate = transport.transport.bpm.value / rest.bpm;
  update((store) => {
    store[trackId].clips[id] = {
      id,
      trackId,
      grainPlayer,
      type,
      ...rest,
    };
    return store;
  });
}

// ----------------- REMOVE TRACK ----------------------------
function removeTrack(id: TrackID) {
  sharedChannel?.push("remove_track", { id });
}

function receiveRemoveTrack({ trackId }: { trackId: TrackID }) {
  update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}

// ----------------- UPDATE ----------------------------
function updateClipProperties(...clips: Clip[]) {
  sharedChannel?.push("update_clip_properties", {
    clips: clipsToClipInfos(clips),
  });
}

function receiveUpdateClipProperties({ clips }: { clips: ClipInfo[] }) {
  update((store) => {
    clips.forEach((clip) => {
      const currentClip = store[clip.trackId].clips[clip.id];
      store[clip.trackId].clips[clip.id] = { ...currentClip, ...clip };
      store[clip.trackId].clips[clip.id].grainPlayer.playbackRate =
        clip.playbackRate;
    });
    return store;
  });
}

// ----------------- UTILS ----------------------------
// HACK: Annoying bug in tonejs makes quantized time values
// in AudioContext time instead of TransportTime
function quantizedTransportTime(quantizedTime: string) {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - transport.transport.seconds;
  console.log(`drift: ${drift}`);
  return nextBarAC - drift;
}

function once(cb: (time: number) => void, { at }: { at: number }) {
  transport.transport.scheduleOnce((time: number) => {
    cb(time);
  }, at);
}

// --------------------- CHANNELS ------------------------------
function joinPrivateChannel(token: Token, currentUser: User) {
  channels.joinPrivateChannel(token, currentUser);
  configureChannelCallbacks(ChannelName.Private);
}

function joinSharedChannel(token: Token) {
  channels.joinSharedChannel(token);
  configureChannelCallbacks(ChannelName.Shared);
}

function configureChannelCallbacks(channelName: ChannelName) {
  for (const [message, callback] of Object.entries(wsCallbacks[channelName])) {
    if (channelName === ChannelName.Private) {
      privateChannel?.on(message, callback);
    } else if (channelName === ChannelName.Shared) {
      sharedChannel?.on(message, callback);
    }
  }
}

const wsCallbacks = {
  shared: {
    new_track: ({ id }: { id: TrackID }) => receiveNewTrack({ id }),
    remove_track: ({ id }: { id: TrackID }) =>
      receiveRemoveTrack({ trackId: id }),
    new_clip: (newClip: NewClip) => receiveNewClip(newClip),
    update_clip_properties: ({ clips }: { clips: Clip[] }) =>
      receiveUpdateClipProperties({ clips }),
  },
  private: {
    play_clip: ({
      clips,
      waitMilliseconds,
    }: {
      clips: ClipInfo[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
    stop_clip: ({ trackIds }: { trackIds: TrackID[] }) =>
      receiveStopClip({ trackIds }),
  },
};

// --------------------- EXPORTS ------------------------------

export default {
  subscribe,
  addTrack,
  addClip,
  removeTrack,
  playClips,
  stopClips,
  updateClipProperties,
  joinPrivateChannel,
  joinSharedChannel,
};
