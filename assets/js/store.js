import { writable } from "svelte/store";
import { fileToB64 } from "./utils";

export function createSessionStore() {
  const { subscribe, update } = writable({ tracks: {} });

  // Store mutators - e2e reactive functions should not modify the store directly!
  function setChannel(channel) {
    update((store) => {
      store.channel = channel;
      for (const [message, handler] of Object.entries(
        msgCallbacks,
      )) {
        store.channel.on(message, handler);
      }
      return store;
    });
  }

  function addTrack() {
    update((store) => {
      store.channel.push("new_track", {
        id: crypto.randomUUID(),
      });
      return store;
    });
  }

  function removeTrack(id) {
    update((store) => {
      store.channel.push("remove_track", { id });
      return store;
    });
  }

  async function addClip(file, trackId, clipId = crypto.randomUUID()) {
    const data = await fileToB64(file);
    update((store) => {
      store.channel.push("new_clip", {
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
      store.channel.push("play_clip", {
        trackId,
        clipId: id,
      });
      return store;
    });
  }

  function stopClip(id, trackId) {
    update((store) => {
      store.channel.push("stop_clip", { id, trackId });
      return store;
    });
  }

  // handle incoming messages on the `Socket`
  const msgCallbacks = {
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
    play_clip: ({ clipId, trackId }) => {
      update((store) => {
        const clips = store.tracks[trackId].clips;
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
    stop_clip: ({ id, trackId }) => {
      update((store) => {
        store.tracks[trackId].clips[id].paused = true;
        store.tracks[trackId].clips[id].currentTime = 0.0;
        return store;
      });
    },
  };

  return {
    subscribe,
    setChannel,
    addTrack,
    addClip,
    removeTrack,
    playClip,
    stopClip,
  };
}
