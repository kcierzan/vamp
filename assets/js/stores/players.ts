import { writable } from "svelte/store";
import { Clip, ClipID, TrackData } from "js/types";
import type { Writable } from "svelte/store";
import { GrainPlayer } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

const playersStore: Writable<PlayerStore> = writable({});
const { subscribe, update, set } = playersStore;

interface PlaybackData {
  grainPlayer: GrainPlayer | null;
  startTime: number;
  endTime: number | null;
}

interface PlayerStore {
  [key: ClipID]: PlaybackData;
}

function stopAudio(clip: Clip, time?: Time) {
  update((store) => {
    store[clip.id].grainPlayer?.stop(time);
    return store;
  });
}

function playAudio(clip: Clip, startTime: Time) {
  update((store) => {
    const grainPlayer = store[clip.id]?.grainPlayer
    if (!!grainPlayer) {
      const startOffset = store[clip.id].startTime;
      const endTime = store[clip.id].endTime;
      const duration = grainPlayer.buffer.duration / grainPlayer.playbackRate;
      const stopTime = !!endTime
        ? `+${(endTime - startOffset) / grainPlayer.playbackRate}`
        : `+${duration}`;

      store[clip.id].grainPlayer?.start(startTime, startOffset).stop(stopTime);
    }
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

function setFromProps(tracks: TrackData[]) {
  const newState = tracks.reduce((acc: PlayerStore, track) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = {
        grainPlayer: createGrainPlayer(clip),
        startTime: clip.start_time,
        endTime: clip.end_time,
      };
    }
    return acc;
  }, {});
  set(newState);
}

function initializeGrainPlayers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.id] = {
        grainPlayer: createGrainPlayer(clip),
        startTime: clip.start_time,
        endTime: clip.end_time,
      };
    }
    return store;
  });
}

function updateGrainPlayers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      if (!!store[clip.id].grainPlayer) {
        store[clip.id].grainPlayer!.playbackRate = clip.playback_rate;
        store[clip.id].startTime = clip.start_time;
        store[clip.id].endTime = clip.end_time;
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
  setFromProps,
  initializeGrainPlayers,
  updateGrainPlayers,
};
