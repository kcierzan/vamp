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

  function setClipPlayingVisual({ clipId, playEvent, track, time }) {
    Draw.schedule(() => {
      update((store) => {
        store.transport.clear(track.playEvent);
        if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
          track.clips[track.currentlyPlaying].paused = true;
        }
        track.clips[clipId].paused = false;
        track.currentlyPlaying = clipId;
        track.playEvent = playEvent;
        return store;
      });
    }, time);
  }

  function stopGrainPlayer({ track, time }) {
    !!track.currentlyPlaying &&
      track.clips[track.currentlyPlaying].grainPlayer.stop(time);
  }

  function stopClipPlayingVisual({ clipId, track, time }) {
    Draw.schedule(() => {
      update((store) => {
        track.clips[clipId].paused = true;
        track.currentlyPlaying = null;
        track.playEvent = null;
        return store;
      });
    }, time);
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

  const wsCallbacks = {
    shared: {
      new_track: ({ id }) => {
        update((store) => {
          const newTracks = { ...store.tracks, [id]: { id, clips: {} } };
          return { ...store, tracks: newTracks };
        });
      },
      remove_track: ({ id }) => {
        update((store) => {
          const { [id]: _, ...remainingTracks } = store.tracks;
          return { ...store, tracks: remainingTracks };
        });
      },
      new_clip: (newClip) => {
        const { id, trackId, data, type, ...rest } = newClip;
        const url = b64ToAudioSrc(data, type);

        update((store) => {
          const grainPlayer = new GrainPlayer(url).toDestination();
          store.tracks[trackId].clips[id] = {
            id,
            trackId,
            grainPlayer,
            type,
            ...rest,
          };
          return store;
        });
      },
      change_playback_rate: ({ id, trackId, playbackRate }) => {
        update((store) => {
          store.tracks[trackId].clips[id].playbackRate = playbackRate;
          return store;
        });
      },
    },
    private: {
      play_clip: ({ clipId, trackId, waitMilliseconds }) => {
        update((store) => {
          store.transport.bpm.value = 116;
          store.transport.start();

          const track = store.tracks[trackId];
          const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
          const nextBarTT = quantizedTransportTime("@1m", store.transport);
          const fireAt = !!track.playEvent
            ? nextBarTT
            : nowWithLatencyCompensation;

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
              setClipPlayingVisual({ clipId, playEvent, track, time });
            },
            { at: fireAt, transport: store.transport },
          );

          return store;
        });
      },
      stop_clip: ({ id, trackId }) => {
        update((store) => {
          const track = store.tracks[trackId];
          const nextBarTT = quantizedTransportTime("@1m", store.transport);

          once(
            (time) => {
              stopGrainPlayer({ track, time });
              store.transport.clear(track.playEvent);
              stopClipPlayingVisual({ clipId: id, track, time });
            },
            { transport: store.transport, at: nextBarTT },
          );
          return store;
        });
      },
    },
  };

  // Store mutators - e2e reactive functions should not modify the store directly!
  function configureChannelCallbacks(channelName) {
    const callbacks = getWsCallbacksForChannel(channelName);
    update((store) => {
      for (const [message, callback] of Object.entries(callbacks)) {
        store.channels[channelName].on(message, callback);
      }
      return store;
    });
  }

  function joinUserChannel(currentUser) {
    const liveSetPrivateChannel = `private:${currentUser.id}`;
    update((store) => {
      store.channels.user = joinChannel(socketPath, liveSetPrivateChannel);
      return store;
    });
    configureChannelCallbacks("user");
  }

  function joinSharedChannel() {
    update((store) => {
      store.channels.shared = joinChannel(socketPath, liveSetSharedChannel);
      return store;
    });
    configureChannelCallbacks("shared");
  }

  async function addTrack() {
    await Tone.start();
    console.log("tone has started");
    update((store) => {
      store.channels.shared.push("new_track", {
        id: crypto.randomUUID(),
      });
      return store;
    });
  }

  function removeTrack(id) {
    update((store) => {
      store.channels.shared.push("remove_track", { id });
      return store;
    });
  }

  async function addClip(file, trackId, clipId = crypto.randomUUID()) {
    const data = await fileToB64(file);
    update((store) => {
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
    update((store) => {
      store.channels.shared.push("play_clip", {
        trackId,
        clipId: id,
      });
      return store;
    });
  }

  function stopClip(id, trackId) {
    update((store) => {
      store.channels.shared.push("stop_clip", { id, trackId });
      return store;
    });
  }

  function changePlaybackRate(id, trackId, playbackRate) {
    update((store) => {
      store.channels.shared.push("change_playback_rate", {
        id,
        trackId,
        playbackRate,
      });
      return store;
    });
  }

  function clearLatency() {
    update((store) => {
      store.channels.shared.push("clear_latency");
      return store;
    });
  }

  function getLatency() {
    update((store) => {
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
    update((store) => {
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
