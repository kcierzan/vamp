import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import * as Tone from "tone";

const initialState = {
  transport: Tone.Transport,
  state: PlayState.Stopped,
};

const transport: Writable<TransportStore> = writable(initialState);
const { subscribe, update } = transport;

function start(time: number | string) {
  update((store) => {
    store.transport.start(time);
    store.state = PlayState.Playing;
    return store;
  });
}

function stop() {
  update((store) => {
    store.transport.stop();
    store.state = PlayState.Stopped;
    return store;
  });
}

function setBpm(bpm: number) {
  update((store) => {
    if (store.transport?.bpm) {
      store.transport.bpm.value = bpm;
    }
    return store;
  });
}

export default {
  subscribe,
  stop,
  start,
  setBpm,
};
