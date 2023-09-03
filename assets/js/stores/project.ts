import type { Writable } from "svelte/store";
import type { TrackStore } from "js/types";
import { writable } from "svelte/store";

const project: Writable<TrackStore> = writable({});

export default project;
