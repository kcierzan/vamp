import { Clip, ClipID, PlayState, TrackData } from "js/types";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export interface ClipStore {
  [key: ClipID]: {
    state: PlayState
  }
}

const clipStore: Writable<ClipStore> = writable({});
const { subscribe, update, set } = clipStore;


function setClipState(clip: Clip, state: PlayState) {
  update((store) => {
    store[clip.id].state = state;
    return store;
  });
}

function setFromProps(tracks: TrackData[]) {
  const newState = tracks.reduce((acc: ClipStore, track) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = {
        state: PlayState.Stopped,
      };
    }
    return acc;
  }, {});
  set(newState);
}

function initializeClipStates(...clips: Clip[]) {
  update(store => {
    for (const clip of clips) {
      store[clip.id] = { state: PlayState.Stopped };
    }
    return store;
  })
}

export default {
  subscribe,
  initializeClipStates,
  setClipState,
  setFromProps,
}
