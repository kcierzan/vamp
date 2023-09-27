import type { Time } from "tone/build/esm/core/type/Units";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import * as Tone from "tone";
import { PlayState, PrivateMessages, TransportStore } from "js/types";
import { pushShared } from "js/channels";
import trackPlaybackStore from "js/stores/tracks";

const initialState = {
  transport: Tone.Transport,
  state: PlayState.Stopped,
  bpm: 120,
};

const transport: Writable<TransportStore> = writable(initialState);
const { subscribe, update } = transport;

function receiveStartTransport({
  waitMilliseconds,
}: {
  waitMilliseconds: number;
}) {
  update((store) => {
    store.transport.start(`+${waitMilliseconds / 1000 + 0.1}`);
    store.state = PlayState.Playing;
    return store;
  });
}

function receiveStopTransport({
  waitMilliseconds,
}: {
  waitMilliseconds: number;
}) {
  update((store) => {
    store.transport.stop(`+${waitMilliseconds / 1000 + 0.1}`);
    store.state = PlayState.Stopped;
    trackPlaybackStore.stopAllTracksAudio();
    return store;
  });
}

function start(): void {
  pushShared(PrivateMessages.StartTransport, {});
}

function startLocal(time: Time) {
  update((store) => {
    store.transport.start(time);
    store.state = PlayState.Playing;
    return store;
  });
}

function stop(): void {
  pushShared(PrivateMessages.StopTransport, {});
}

function setBpm(bpm: number): void {
  update((store) => {
    if (store.transport?.bpm?.value) {
      store.transport.bpm.value = bpm;
      store.bpm = bpm;
    }
    return store;
  });
}

function rampToBpm(bpm: number): void {
  update((store) => {
    if (store.transport?.bpm?.value) {
      store.transport.bpm.setValueAtTime(bpm, "+0.5");
    }
    store.bpm = bpm;
    return store;
  });
}

function setPosition(position: Time): void {
  update((store) => {
    store.transport.position = position;
    return store;
  });
}

export default {
  subscribe,
  stop,
  start,
  receiveStartTransport,
  receiveStopTransport,
  startLocal,
  setBpm,
  rampToBpm,
  setPosition,
};
