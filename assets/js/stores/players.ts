import { writable } from "svelte/store";
import { Clip, ClipID, TrackData } from "js/types";
import type { Writable } from "svelte/store";
import { GrainPlayer } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

const playersStore: Writable<PlayerStore> = writable({});
const { subscribe, update, set } = playersStore;

interface PlaybackData {
  grainPlayer: GrainPlayer | null;
}

interface PlayerStore {
  [key: ClipID]: PlaybackData;
}

function stopAudio(clip: Clip, time: Time | undefined) {
  update((store) => {
    store[clip.id].grainPlayer?.stop(time);
    return store;
  });
}

function playAudio(clip: Clip, startTime: Time, stopTime: Time) {
  update((store) => {
    store[clip.id].grainPlayer?.start(startTime).stop(stopTime);
    return store;
  });
}

function setPlaybackRate(clip: Clip, playbackRate: number) {
  update((store) => {
    if (!!store[clip.id].grainPlayer) {
      store[clip.id].grainPlayer!.playbackRate = playbackRate;
    }
    return store;
  });
}

function createGrainPlayer(clip: Clip): GrainPlayer | null {
  if (clip.audio_file?.file.url) {
    const grainPlayer = new GrainPlayer(
      decodeURI(clip.audio_file.file.url),
    ).toDestination();
    grainPlayer.grainSize = 0.2;
    grainPlayer.overlap = 0.05;
    grainPlayer.playbackRate = clip.playback_rate;
    return grainPlayer;
  }
  return null;
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
      store[clip.id].grainPlayer = grainPlayer;
      return store;
    });
  }
}

function setFromProps(tracks: TrackData[]) {
  const newState = tracks.reduce((acc: PlayerStore, track) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = {
        grainPlayer: createGrainPlayer(clip),
      };
    }
    return acc;
  }, {});
  set(newState);
}

function initializeGrainPlayers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.id] = { grainPlayer: createGrainPlayer(clip) };
    }
    return store;
  });
}

function updateGrainPlayers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      if (!!store[clip.id].grainPlayer) {
        store[clip.id].grainPlayer!.playbackRate = clip.playback_rate;
      }
    }
    return store;
  });
}

export default {
  subscribe,
  playAudio,
  stopAudio,
  setPlaybackRate,
  setupGrainPlayer,
  setFromProps,
  initializeGrainPlayers,
  updateGrainPlayers,
};
