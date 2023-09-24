import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { AudioFile } from "js/types";

const poolStore: Writable<AudioFile[]> = writable([]);

export default poolStore;
