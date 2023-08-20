import { writable } from "svelte/store";
import { fileToB64, b64ToAudioSrc, joinChannel } from "./utils";
import * as Tone from "tone";
import { GrainPlayer, Transport, Draw, Loop } from "tone";

function createSessionStore() {
  const socketPath = "/socket";
  const liveSetSharedChannel = "liveset:shared";

  const intialState = {
    tracks: {},
    channels: {
      shared: null,
      user: null,
    },
    transport: Transport,
    latency: 0,
  };

  const { subscribe, update } = writable(intialState);

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
          const track = store.tracks[trackId];
          const clipToPlay = track.clips[clipId];
          const waitSeconds = waitMilliseconds / 1000;

          store.transport.bpm.value = 120;

          let clipAlreadyPlaying = false;
          if (track.loop) {
            track.loop.stop();
            track.loop = null;
            clipAlreadyPlaying = true;
          }

          track.loop = new Loop((time) => {
            clipToPlay.grainPlayer.start(time).stop("+1m");
          }, "1m").start(waitSeconds);

          store.transport.scheduleOnce((time) => {
            const drawDelay = clipAlreadyPlaying ? "@1m" : time;
            Draw.schedule(() => {
              update((store) => {
                if (
                  track.currentlyPlaying &&
                  track.currentlyPlaying !== clipId
                ) {
                  track.clips[track.currentlyPlaying].paused = true;
                }
                track.clips[clipId].paused = false;
                track.currentlyPlaying = clipId;
                return store;
              });
            }, drawDelay);
          }, `+${waitSeconds}`);

          store.transport.start();
          return store;
        });
      },
      stop_clip: ({ id, trackId, waitMilliseconds }) => {
        update((store) => {
          const track = store.tracks[trackId];
          const waitSeconds = waitMilliseconds / 1000;

          store.transport.scheduleOnce((_time) => {
            if (track.loop) {
              track.loop.stop("1m");
              track.loop = null;
            }
            Draw.schedule(() => {
              update((store) => {
                track.clips[id].paused = true;
                track.currentlyPlaying = null;
                return store;
              });
            }, "@1m");
          }, `+${waitSeconds}`);
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
