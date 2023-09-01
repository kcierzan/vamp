import type { Time } from "tone/build/esm/core/type/Units";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import * as Tone from "tone";
import { PlayState, TransportStore } from "js/types";

const initialState = {
  transport: Tone.Transport,
  state: PlayState.Stopped,
  bpm: 120,
};

const transport: Writable<TransportStore> = writable(initialState);
const { subscribe, update } = transport;

function start(time?: Time) {
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
    if (store.transport?.bpm?.value) {
      store.transport.bpm.value = bpm;
      store.bpm = bpm;
    }
    return store;
  });
}

function rampToBpm(bpm: number) {
  update((store) => {
    if (store.transport?.bpm?.value) {
      store.transport.bpm.setValueAtTime(bpm, "+0.1");
    }
    store.bpm = bpm;
    return store;
  });
}

function setPosition(position: Time) {
  update((store) => {
    store.transport.position = position;
    return store;
  });
}

export default {
  subscribe,
  stop,
  start,
  setBpm,
  rampToBpm,
  setPosition,
};
