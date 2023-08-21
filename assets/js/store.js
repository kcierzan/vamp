import { writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc, joinChannel } from "./utils";
import * as Tone from "tone";
import { GrainPlayer, Transport, Draw, Time } from "tone";

function createSessionStore() {
  const socketPath = "/socket";
  const liveSetSharedChannel = "liveset:shared";

  const initialState = {
    tracks: {},
    channels: {
      shared: null,
      user: null,
    },
    transport: Transport,
    latency: 0,
    running: false,
  };

  const { subscribe, update } = writable(initialState);

  // ------------------- Message receiver functions ----------------------------
  function withStore(cb, args) {
    update((store) => {
      return cb(store, args);
    });
  }

  function stopGrainPlayer({ track, time }) {
    !!track.currentlyPlaying &&
      track.clips[track.currentlyPlaying].grainPlayer.stop(time);
  }

  function stopVisual(store, { clipId, track }) {
    track.clips[clipId].paused = true;
    track.currentlyPlaying = null;
    track.playEvent = null;
    return store
  }

  function drawStopClip({ clipId, track, time }) {
    Draw.schedule(() => {
      withStore(stopVisual, { clipId, track });
    }, time);
  }

  function playVisual(store, { clipId, playEvent, track }) {
    store.transport.clear(track.playEvent);
    if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
      track.clips[track.currentlyPlaying].paused = true;
    }
    track.clips[clipId].paused = false;
    track.currentlyPlaying = clipId;
    track.playEvent = playEvent;
    return store;
  }

  function drawPlayClip({ clipId, playEvent, track, time }) {
    Draw.schedule(() => {
      withStore(playVisual, { clipId, playEvent, track });
    }, time);
  }

  function receiveStopClip(store, { clipId, trackId }) {
    const track = store.tracks[trackId];
    const nextBarTT = quantizedTransportTime("@1m", store.transport);
    once(
      (time) => {
        stopGrainPlayer({ track, time });
        store.transport.clear(track.playEvent);
        drawStopClip({ clipId, track, time });
      },
      { transport: store.transport, at: nextBarTT },
    );
    return store;
  }

  function receivePlayClip(store, { clipId, trackId, waitMilliseconds }) {
    store.transport.bpm.value = 116;
    store.transport.start();

    const track = store.tracks[trackId];
    const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
    const nextBarTT = quantizedTransportTime("@1m", store.transport);
    const fireAt = !!track.playEvent ? nextBarTT : nowWithLatencyCompensation;

    const playEvent = loopClip({
      clip: track.clips[clipId],
      transport: store.transport,
      until: "+1m",
      frequency: "1m",
      time: fireAt,
    });

    once(
      (time) => {
        stopGrainPlayer({ track, time });
        drawPlayClip({ clipId, playEvent, track, time });
      },
      { at: fireAt, transport: store.transport },
    );
    return store;
  }

  // HACK: Annoying bug in tonejs makes quantized time values
  // in AudioContext time instead of TransportTime
  function quantizedTransportTime(quantizedTime, transport) {
    const nextBarAC = Time(quantizedTime).toSeconds();
    const drift = Tone.now() - transport.seconds;
    return nextBarAC - drift;
  }

  function loopClip({ clip, transport, until, frequency, time }) {
    return transport.scheduleRepeat(
      (audioContextTime) => {
        clip.grainPlayer.start(audioContextTime).stop(until);
      },
      frequency,
      time,
    );
  }

  function once(cb, { at, transport }) {
    transport.scheduleOnce((time) => {
      cb(time);
    }, at);
  }

  function receiveNewTrack(store, { id }) {
    const newTracks = {
      ...store.tracks,
      [id]: { id: id, clips: {} },
    };
    return { ...store, tracks: newTracks };
  }

  function receiveRemoveTrack(store, { trackId }) {
    const { [trackId]: _, ...remainingTracks } = store.tracks;
    return { ...store, tracks: remainingTracks };
  }

  function receiveNewClip(store, newClip) {
    const { id, trackId, data, type, ...rest } = newClip;
    const url = b64ToAudioSrc(data, type);
    const grainPlayer = new GrainPlayer(url).toDestination();
    store.tracks[trackId].clips[id] = {
      id,
      trackId,
      grainPlayer,
      type,
      ...rest,
    };
    return store;
  }

  function receiveChangePlaybackRate(store, { clipId, trackId, playbackRate }) {
    store.tracks[trackId].clips[clipId].playbackRate = playbackRate;
    return store;
  }

  // ---------------- Store mutators - e2e reactive functions should not modify the store directly! ------------------------
  function configureChannelCallbacks(channelName) {
    const callbacks = getWsCallbacksForChannel(channelName);
    withStore((store) => {
      for (const [message, callback] of Object.entries(callbacks)) {
        store.channels[channelName].on(message, callback);
      }
      return store;
    });
  }

  function joinUserChannel(currentUser) {
    const liveSetPrivateChannel = `private:${currentUser.id}`;
    withStore((store) => {
      store.channels.user = joinChannel(socketPath, liveSetPrivateChannel);
      return store;
    });
    configureChannelCallbacks("user");
  }

  function joinSharedChannel() {
    withStore((store) => {
      store.channels.shared = joinChannel(socketPath, liveSetSharedChannel);
      return store;
    });
    configureChannelCallbacks("shared");
  }

  async function addTrack() {
    await Tone.start();
    console.log("tone has started");
    withStore((store) => {
      store.channels.shared.push("new_track", {
        id: crypto.randomUUID(),
      });
      return store;
    });
  }

  function removeTrack(id) {
    withStore((store) => {
      store.channels.shared.push("remove_track", { id });
      return store;
    });
  }

  async function addClip(file, trackId, clipId = crypto.randomUUID()) {
    const data = await fileToB64(file);
    withStore((store) => {
      store.channels.shared.push("new_clip", {
        id: clipId,
        name: file.name,
        data: data,
        type: file.type,
        trackId: trackId,
        paused: true,
        currentTime: 0.0,
        playbackRate: 100,
      });
      return store;
    });
  }

  function playClip(id, trackId) {
    withStore((store) => {
      store.channels.shared.push("play_clip", {
        trackId,
        clipId: id,
      });
      return store;
    });
  }

  function stopClip(id, trackId) {
    withStore((store) => {
      store.channels.shared.push("stop_clip", { id, trackId });
      return store;
    });
  }

  function changePlaybackRate(id, trackId, playbackRate) {
    withStore((store) => {
      store.channels.shared.push("change_playback_rate", {
        id,
        trackId,
        playbackRate,
      });
      return store;
    });
  }

  function clearLatency() {
    withStore((store) => {
      store.channels.shared.push("clear_latency");
      return store;
    });
  }

  function getLatency() {
    withStore((store) => {
      store.channels.shared.push("get_latency").receive("ok", (response) => {
        store.latency = response;
      });
      return store;
    });
  }

  function measureLatency(count = 20) {
    if (count <= 0) {
      getLatency();
      return;
    }
    withStore((store) => {
      store.channels.shared
        .push("ping", { client_time: Date.now() })
        .receive("ok", ({ up, server_time }) => {
          const down = Date.now() - server_time;
          store.channels.shared.push("report_latency", {
            latency: (up + down) / 2,
          });
        });
      setTimeout(() => measureLatency(count - 1), 100);
      return store;
    });
  }

  const wsCallbacks = {
    shared: {
      new_track: (args) => withStore(receiveNewTrack, args),
      remove_track: ({ id }) => withStore(receiveRemoveTrack, { trackId: id }),
      new_clip: (newClip) => withStore(receiveNewClip, newClip),
      change_playback_rate: ({ id, trackId, playbackRate }) =>
        withStore(receiveChangePlaybackRate, {
          clipId: id,
          trackId,
          playbackRate,
        }),
    },
    private: {
      play_clip: (args) => withStore(receivePlayClip, args),
      stop_clip: ({ id, trackId }) =>
        withStore(receiveStopClip, { clipId: id, trackId }),
    },
  };

  function getWsCallbacksForChannel(channelName) {
    return channelName === "shared" ? wsCallbacks.shared : wsCallbacks.private;
  }

  return {
    subscribe,
    addTrack,
    addClip,
    removeTrack,
    playClip,
    stopClip,
    changePlaybackRate,
    joinUserChannel,
    joinSharedChannel,
    measureLatency,
    clearLatency,
  };
}

export const sessionStore = createSessionStore();
