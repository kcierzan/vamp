import { get } from "svelte/store";
import type { Time } from "tone/build/esm/core/type/Units";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { Transport, Draw } from "tone";
import * as Tone from "tone";
import { PlayState, TransportStore } from "js/types";
import trackPlaybackStore from "js/stores/tracks";
import { round } from "js/utils";

const initialState = {
  transport: Tone.Transport,
  state: PlayState.Stopped,
  bpm: 120,
  barsBeatsSixteenths: "0:0:0",
  seconds: "0.00",
  bbsUpdateEvent: null,
  secondsUpdateEvent: null,
};

const transport: Writable<TransportStore> = writable(initialState);
const { subscribe, update } = transport;

function stopOrPauseLocal({ waitMilliseconds }: { waitMilliseconds: number }) {
  const updateTime = `+${waitMilliseconds / 1000}`;
  update((store) => {
    store.state === PlayState.Playing
      ? pauseLocal(updateTime)
      : stopLocal(updateTime);
    clearTransportUpdates();
    trackPlaybackStore.stopAllTracksAudio();
    return store;
  });
}

function startLocal(time: Time) {
  scheduleTransportUpdates();
  update((store) => {
    store.transport.start(time);
    store.state = PlayState.Playing;
    return store;
  });
}

function stopLocal(at: Time) {
  const trackIds = Object.keys(get(trackPlaybackStore));
  for (const trackId of trackIds) {
    trackPlaybackStore.stopTrack(trackId, "+0.001");
  }
  update((store) => {
    store.transport.stop(at);
    store.state = PlayState.Stopped;
    store.seconds = "0.00";
    store.barsBeatsSixteenths = "0:0:0";
    return store;
  });
}

function pauseLocal(at: Time) {
  update((store) => {
    store.transport.pause(at);
    store.state = PlayState.Paused;
    return store;
  });
}

function scheduleTransportUpdates() {
  update((store) => {
    store.secondsUpdateEvent = scheduleSecondsUpdate();
    store.bbsUpdateEvent = scheduleBarsBeatsSixteenthsUpdate();
    return store;
  });
}

function clearTransportUpdates() {
  clearBbsUpdateEvent();
  clearSecondsUpdateEvent();
}

function scheduleBarsBeatsSixteenthsUpdate() {
  clearBbsUpdateEvent();
  return Transport.scheduleRepeat((time: Time) => {
    Draw.schedule(() => {
      update((store) => {
        const [bars, beats, sixteenths] = store.transport.position
          .toString()
          .split(":");
        store.barsBeatsSixteenths = `${bars}:${beats}:${Math.floor(
          parseInt(sixteenths),
        )}`;
        return store;
      });
    }, time);
  }, "16n");
}

function clearBbsUpdateEvent() {
  update((store) => {
    store.bbsUpdateEvent !== null && Transport.clear(store.bbsUpdateEvent);
    return store;
  });
}

function scheduleSecondsUpdate() {
  clearSecondsUpdateEvent();
  return Transport.scheduleRepeat((time) => {
    Draw.schedule(() => {
      update((store) => {
        const now = round(store.transport.seconds, 100);
        store.seconds = now.toFixed(2);
        return store;
      });
    }, time);
  }, "10hz");
}

function clearSecondsUpdateEvent() {
  update((store) => {
    store.secondsUpdateEvent !== null &&
      Transport.clear(store.secondsUpdateEvent);
    return store;
  });
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

function initialize(bpm: number) {
  setBpm(bpm);
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
  startLocal,
  stopOrPauseLocal,
  setBpm,
  rampToBpm,
  setPosition,
  initialize,
};
