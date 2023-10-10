import { ClipID, TrackID } from "js/types";
import { writable, Writable } from "svelte/store";

export interface SelectedStore {
  trackId: TrackID | null;
  clipId: ClipID | null;
}

const selectedStore: Writable<SelectedStore> = writable({
  trackId: null,
  clipId: null,
});

const { subscribe, set } = selectedStore;

export default {
  subscribe,
  set,
};
