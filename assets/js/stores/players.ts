import { writable } from "svelte/store";
import { Clip, ClipID } from "js/types";
import type { Writable } from "svelte/store";
import { GrainPlayer } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

const players: Writable<PlayerStore> = writable({});
const { subscribe, update } = players;

interface PlayerStore {
  [key: ClipID]: GrainPlayer;
}

function stopAudio(clip: Clip, time: Time | undefined) {
  update((store) => {
    store[clip.id].stop(time);
    return store;
  });
}

function playAudio(clip: Clip, startTime: Time, stopTime: Time) {
  update((store) => {
    store[clip.id].start(startTime).stop(stopTime);
    return store;
  });
}

function setPlaybackRate(clip: Clip, playbackRate: number) {
  update(store => {
    store[clip.id].playbackRate = playbackRate;
    return store;
  })
}

function setupGrainPlayer(clip: Clip) {
  if (clip.audio_file?.file.url) {
    const grainPlayer = new GrainPlayer(
      decodeURI(clip.audio_file.file.url),
    ).toDestination();
    grainPlayer.grainSize = 0.2;
    grainPlayer.overlap = 0.05;
    grainPlayer.playbackRate = clip.playback_rate;
    update((store) => {
      store[clip.id] = grainPlayer;
      return store;
    });
  }
}

export { 
  subscribe,
  playAudio,
  stopAudio,
  setPlaybackRate,
  setupGrainPlayer,
};
