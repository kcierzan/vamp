import { writable } from "svelte/store";
import { fileToB64, joinChannel } from "./utils";
import { Transport } from "tone";

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
        const { id, trackId } = newClip;
        update((store) => {
          store.tracks[trackId].clips[id] = newClip;
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
          // TODO: this should interact with Tone.Transport instead
          // and then update any visual state in a Tone.Draw callback
          const clips = store.tracks[trackId].clips;
          console.log(
            `We should have waited ${waitMilliseconds} milliseconds before playing!`,
          );
          // FIXME: we probably want a constant-time lookup of clips as to minimize delay
          // with large livesets
          for (const [id, clip] of Object.entries(clips)) {
            if (id === clipId) {
              clip.paused = false;
            } else {
              clip.paused = true;
              clip.currentTime = 0.0;
            }
          }
          return store;
        });
      },
      stop_clip: ({ id, trackId, waitMilliseconds }) => {
        update((store) => {
          console.log(
            `We should have waited ${waitMilliseconds} milliseconds before stopping!`,
          );
          store.tracks[trackId].clips[id].paused = true;
          store.tracks[trackId].clips[id].currentTime = 0.0;
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

  function addTrack() {
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
