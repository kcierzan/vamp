import { writable } from "svelte/store";
import { Transport } from "tone";

const initialState = {
  transport: Transport,
  state: "stopped",
};

const transport = writable(initialState);
const { subscribe, update } = transport;

function start() {
  update((store) => {
    store.transport.start();
    store.state = "playing";
    return store;
  });
}

function stop() {
  update((store) => {
    store.transport.stop();
    store.state = "stopped";
    return store;
  });
}

function setBpm(bpm) {
  update((store) => {
    store.transport.bpm = bpm;
    return store;
  });
}

export default {
  subscribe,
  stop,
  start,
  setBpm,
};
