import { writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc } from "../utils";
import * as Tone from "tone";
import { GrainPlayer, Draw, Time } from "tone";
import channels from "./channels";
import transportStore from "./transport";

let sessionStoreValue;
let transport;
let sharedChannel;
let privateChannel;

const sessionStore = writable({});
const { subscribe, update } = sessionStore;

sessionStore.subscribe((value) => {
  sessionStoreValue = value;
});

channels.subscribe((value) => {
  sharedChannel = value.shared;
  privateChannel = value.private;
});

transportStore.subscribe((value) => {
  transport = value;
})

// ------------------- Message receiver functions ----------------------------
function stopGrainPlayer({ track, time }) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].grainPlayer.stop(time);
}

function stopVisual({ track }) {
  update((store) => {
    for (const clip of Object.values(track.clips)) {
      clip.state = "stopped";
    }
    track.currentlyPlaying = null;
    track.playEvent = null;
    return store;
  });
}

function drawStopClip({ track, time }) {
  Draw.schedule(() => stopVisual({ track }), time);
}

function playVisual({ clipId, playEvent, track }) {
  update((store) => {
    // cancel loops scheduled for the currently playing clip
    transport.transport.clear(track.playEvent);

    // if there is a clip playing for this track, set it to `stopped`
    if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
      store[track.id].clips[track.currentlyPlaying].state = "stopped";
    }

    // set the target clip to a playing state
    store[track.id].clips[clipId].state = "playing";
    store[track.id].currentlyPlaying = clipId;
    store[track.id].playEvent = playEvent;
    return store;
  });
}

function drawPlayClip({ clipId, playEvent, track, time }) {
  Draw.schedule(() => playVisual({ clipId, playEvent, track }), time);
}

function receiveStopClip({ trackIds }) {
  const nextBarTT = quantizedTransportTime("@1m");
  console.log(`NOW: ${transport.transport.seconds}`)
  console.log(`Stopping at: ${nextBarTT}`)

  for (const trackId of trackIds) {
    const track = sessionStoreValue[trackId];
    once(
      (time) => {
        console.log(`callback invoked at ${transport.transport.seconds}`)
        stopGrainPlayer({ track, time });
        transport.transport.clear(track.playEvent);
        drawStopClip({ track, time });
      },
      { at: nextBarTT },
    );
  }
}

function drawQueueClips(playClips) {
  Draw.schedule(() => {
    update((store) => {
      Object.entries(playClips).forEach(([trackId, clipId]) => {
        store[trackId].clips[clipId].state = "queued";
      });
      return store;
    });
  }, Tone.now());
}

function receivePlayClips({ waitMilliseconds, ...clips }) {
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
  const nextBarTT = quantizedTransportTime("@1m");
  const fireAt = transport.state === "playing" ? nextBarTT : nowWithLatencyCompensation;
  transport.state === "playing" && drawQueueClips(clips);
  transportStore.start();

  Object.entries(clips).forEach(([trackId, clipId]) => {
    const track = sessionStoreValue[trackId];
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
  });
}

// HACK: Annoying bug in tonejs makes quantized time values
// in AudioContext time instead of TransportTime
function quantizedTransportTime(quantizedTime) {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - transport.transport.seconds;
  return nextBarAC - drift;
}

function loopClip({ clip, until, frequency, time }) {
  return transport.transport.scheduleRepeat(
    (audioContextTime) => {
      clip.grainPlayer.start(audioContextTime).stop(until);
    },
    frequency,
    time,
  );
}

function once(cb, { at }) {
  transport.transport.scheduleOnce((time) => {
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
  grainPlayer.grainSize = 0.2
  grainPlayer.overlap = 0.05
  grainPlayer.playbackRate = transport.transport.bpm.value / rest.bpm
  console.log(grainPlayer.playbackRate)
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
    store[trackId].clips[clipId].grainPlayer.playbackRate = playbackRate;
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

async function addClip({ file, trackId, clipId, bpm }) {
  const id = clipId ?? crypto.randomUUID()
  const data = await fileToB64(file);
  sharedChannel.push("new_clip", {
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

function playClip(id, trackId) {
  playClips({ [trackId]: id });
}

function playClips(trackClips) {
  drawQueueClips(trackClips);
  sharedChannel.push("play_clip", trackClips);
}

function stopClips(trackIds) {
  sharedChannel.push("stop_clip", { trackIds });
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
    play_clip: (args) => receivePlayClips(args),
    stop_clip: ({ trackIds }) => receiveStopClip({ trackIds }),
  },
};

export default {
  subscribe,
  addTrack,
  addClip,
  removeTrack,
  playClip,
  playClips,
  stopClips,
  changePlaybackRate,
  joinPrivateChannel,
  joinSharedChannel,
};
