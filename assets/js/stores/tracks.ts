import type { Writable } from "svelte/store";
import type {
  TrackStore,
  ClipInfo,
  ClipID,
  Clip,
  Track,
  TrackID,
  NewClip,
  User,
  Token,
} from "./types";
import { get, writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc, addChannelListener } from "../utils";
import * as Tone from "tone";
import { GrainPlayer, Draw, Time } from "tone";
import channels from "./channels";
import { ChannelName, PlayState } from "./types";
import { Transport } from "tone";
import PlayableClip from "js/playableClip";
import { pushShared, once } from "../utils";

const trackStore: Writable<TrackStore> = writable({});
const { update } = trackStore;

// ----------------- STOP ----------------------------
function stopClips(trackIds: TrackID[]) {
  pushShared("stop_clip", { trackIds });
}

function receiveStopClip({ trackIds }: { trackIds: TrackID[] }) {
  const nextBarTT = quantizedTransportTime("@1m");
  console.log(`STOP NOW: ${Transport.seconds}`);
  console.log(`Stopping at: ${nextBarTT}`);

  for (const trackId of trackIds) {
    const track = get(trackStore)[trackId];
    track.playEvent !== null && Transport.clear(track.playEvent);
    once(
      (time: number) => {
        const now = Transport.seconds;
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
    track.clips[track.currentlyPlaying].stopAudio(time);
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
  Draw.schedule(() => {
    console.log(`drawing stop clip at ${time}`);
    stopVisual({ track });
  }, time);
}

// ----------------- NEW TRACK ----------------------------
async function addTrack() {
  await Tone.start();
  console.log("tone has started");
  pushShared("new_track", { id: crypto.randomUUID() });
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
async function addClip(
  file: File,
  trackId: TrackID,
  bpm: number,
  id: ClipID = crypto.randomUUID(),
) {
  const data = await fileToB64(file);
  pushShared("new_clip", {
    id: id,
    name: file.name,
    data: data,
    type: file.type,
    trackId: trackId,
    state: PlayState.Stopped,
    currentTime: 0.0,
    playbackRate: Transport.bpm.value / bpm,
    bpm,
  });
}

function receiveNewClip(newClip: NewClip) {
  const { trackId, name, bpm, id, state, data, type, playbackRate } = newClip;
  const url = b64ToAudioSrc(data, type);
  const grainPlayer = new GrainPlayer(url).toDestination();
  const playableClip = new PlayableClip(
    trackId,
    name,
    type,
    playbackRate,
    0.0,
    bpm,
    grainPlayer,
    id,
    state,
  );
  update((store) => {
    store[trackId].clips[id] = playableClip;
    return store;
  });
}

// ----------------- REMOVE TRACK ----------------------------
function removeTrack(id: TrackID) {
  pushShared("remove_track", { id });
}

function receiveRemoveTrack({ trackId }: { trackId: TrackID }) {
  update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}

// ----------------- UPDATE ----------------------------
function updateClipProperties(...clips: Clip[]) {
  pushShared("update_clip_properties", {
    clips: clips.map((clip) => clip.serialize()),
  });
}

function receiveUpdateClipProperties({ clips }: { clips: ClipInfo[] }) {
  update((store) => {
    clips.forEach((clip) => {
      const currentClip = store[clip.trackId].clips[clip.id];
      store[clip.trackId].clips[clip.id] = { ...currentClip, ...clip };
      store[clip.trackId].clips[clip.id].setPlaybackRate(clip.playbackRate);
    });
    return store;
  });
}

// ----------------- UTILS ----------------------------
// HACK: Annoying bug in tonejs makes quantized time values
// in AudioContext time instead of TransportTime
function quantizedTransportTime(quantizedTime: string) {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - Transport.seconds;
  console.log(`drift: ${drift}`);
  return nextBarAC - drift;
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
    addChannelListener(channelName, message, callback);
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
    stop_clip: ({ trackIds }: { trackIds: TrackID[] }) =>
      receiveStopClip({ trackIds }),
  },
};

// --------------------- EXPORTS ------------------------------

export default {
  ...trackStore,
  addTrack,
  addClip,
  removeTrack,
  stopClips,
  updateClipProperties,
  joinPrivateChannel,
  joinSharedChannel,
};
