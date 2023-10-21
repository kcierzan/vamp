import { Clip, TrackData } from "js/types";
import { writable, Writable } from "svelte/store";

export interface SelectedStore {
  track: TrackData | null;
  clip: Clip | null;
}

const selectedStore: Writable<SelectedStore> = writable({
  track: null,
  clip: null,
});

const { subscribe, set } = selectedStore;

export default {
  subscribe,
  set,
};
