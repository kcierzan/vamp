import { writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc } from "../utils";
import * as Tone from "tone";
import { GrainPlayer, Transport, Draw, Time } from "tone";
import channels from "./channels";

const transport = Transport;
const sessionStore = writable({});
let sessionStoreValue;
const { subscribe, update } = sessionStore;
sessionStore.subscribe((value) => {
  sessionStoreValue = value;
});

let sharedChannel;
let privateChannel;
channels.subscribe((value) => {
  sharedChannel = value.shared;
  privateChannel = value.private;
});

// ------------------- Message receiver functions ----------------------------
function stopGrainPlayer({ track, time }) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].grainPlayer.stop(time);
}

function stopVisual({ clipId, track }) {
  update((store) => {
    track.clips[clipId].paused = true;
    track.currentlyPlaying = null;
    track.playEvent = null;
    return store;
  });
}

function drawStopClip({ clipId, track, time }) {
  Draw.schedule(() => stopVisual({ clipId, track }), time);
}

function playVisual({ clipId, playEvent, track }) {
  update((store) => {
    // cancel loops scheduled for the currently playing clip
    transport.clear(track.playEvent);

    // if there is a clip playing for this track, set it to paused
    if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
      store[track.id].clips[track.currentlyPlaying].paused = true;
    }

    // set the target clip to a playing state
    store[track.id].clips[clipId].paused = false;
    store[track.id].currentlyPlaying = clipId;
    store[track.id].playEvent = playEvent;
    return store;
  });
}

function drawPlayClip({ clipId, playEvent, track, time }) {
  Draw.schedule(() => playVisual({ clipId, playEvent, track }), time);
}

function receiveStopClip({ clipId, trackId }) {
  const track = sessionStoreValue[trackId];
  const nextBarTT = quantizedTransportTime("@1m");
  once(
    (time) => {
      stopGrainPlayer({ track, time });
      transport.clear(track.playEvent);
      drawStopClip({ clipId, track, time });
    },
    { at: nextBarTT },
  );
}

function receivePlayClip({ waitMilliseconds, ...clips }) {
  transport.bpm.value = 116;
  transport.start();

  Object.entries(clips).forEach(([trackId, clipId]) => {
    const track = sessionStoreValue[trackId];
    const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
    const nextBarTT = quantizedTransportTime("@1m");
    const fireAt = !!track.playEvent ? nextBarTT : nowWithLatencyCompensation;

    const playEvent = loopClip({
      clip: track.clips[clipId],
      until: "+1m",
      frequency: "1m",
      time: fireAt,
    });

    once(
      (time) => {
        stopGrainPlayer({ track, time });
        drawPlayClip({ clipId, playEvent, track, time });
      },
      { at: fireAt },
    );
  })
}

// HACK: Annoying bug in tonejs makes quantized time values
// in AudioContext time instead of TransportTime
function quantizedTransportTime(quantizedTime) {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - transport.seconds;
  return nextBarAC - drift;
}

function loopClip({ clip, until, frequency, time }) {
  return transport.scheduleRepeat(
    (audioContextTime) => {
      clip.grainPlayer.start(audioContextTime).stop(until);
    },
    frequency,
    time,
  );
}

function once(cb, { at }) {
  transport.scheduleOnce((time) => {
    cb(time);
  }, at);
}

function receiveNewTrack({ id }) {
  update((store) => {
    return {
      ...store,
      [id]: { id: id, clips: {} },
    };
  });
}

function receiveRemoveTrack({ trackId }) {
  update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}

function receiveNewClip({ id, trackId, data, type, ...rest }) {
  const url = b64ToAudioSrc(data, type);
  const grainPlayer = new GrainPlayer(url).toDestination();
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

function receiveChangePlaybackRate({ clipId, trackId, playbackRate }) {
  update((store) => {
    store[trackId].clips[clipId].playbackRate = playbackRate;
    return store;
  });
}

// ---------------- Store mutators - e2e reactive functions should not modify the store directly! ------------------------
function configureChannelCallbacks(channelName) {
  for (const [message, callback] of Object.entries(wsCallbacks[channelName])) {
    if (channelName === "private") {
      privateChannel.on(message, callback);
    } else if (channelName === "shared") {
      sharedChannel.on(message, callback);
    }
  }
}

function joinPrivateChannel(token, currentUser) {
  channels.joinPrivateChannel(token, currentUser);
  configureChannelCallbacks("private");
}

function joinSharedChannel(token) {
  channels.joinSharedChannel(token);
  configureChannelCallbacks("shared");
}

async function addTrack() {
  await Tone.start();
  console.log("tone has started");
  sharedChannel.push("new_track", {
    id: crypto.randomUUID(),
  });
}

function removeTrack(id) {
  sharedChannel.push("remove_track", { id });
}

async function addClip(file, trackId, clipId = crypto.randomUUID()) {
  const data = await fileToB64(file);
  sharedChannel.push("new_clip", {
    id: clipId,
    name: file.name,
    data: data,
    type: file.type,
    trackId: trackId,
    paused: true,
    currentTime: 0.0,
    playbackRate: 100,
  });
}

function playClip(id, trackId) {
  playClips({ [trackId]: id });
}

function playClips(trackClips) {
  sharedChannel.push("play_clip", trackClips);
}

function stopClip(id, trackId) {
  sharedChannel.push("stop_clip", { id, trackId });
}

function changePlaybackRate(id, trackId, playbackRate) {
  sharedChannel.push("change_playback_rate", {
    id,
    trackId,
    playbackRate,
  });
}

const wsCallbacks = {
  shared: {
    new_track: ({ id }) => receiveNewTrack({ id }),
    remove_track: ({ id }) => receiveRemoveTrack({ trackId: id }),
    new_clip: (newClip) => receiveNewClip(newClip),
    change_playback_rate: ({ id, trackId, playbackRate }) =>
      receiveChangePlaybackRate({ clipId: id, trackId, playbackRate }),
  },
  private: {
    play_clip: (args) => receivePlayClip(args),
    stop_clip: ({ id, trackId }) => receiveStopClip({ clipId: id, trackId }),
  },
};

export default {
  subscribe,
  addTrack,
  addClip,
  removeTrack,
  playClip,
  playClips,
  stopClip,
  changePlaybackRate,
  joinPrivateChannel,
  joinSharedChannel,
};
