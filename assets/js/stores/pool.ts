import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { AudioFile } from "js/types";

const poolStore: Writable<AudioFile[]> = writable([]);

const { subscribe, set, update } = poolStore;

function createNewPoolFile(audioFile: AudioFile) {
  update((store) => {
    return [...store, audioFile];
  });
}

export default {
  subscribe,
  set,
  createNewPoolFile,
};
