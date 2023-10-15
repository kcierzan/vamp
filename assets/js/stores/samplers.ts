import { writable } from "svelte/store";
import { Clip, ClipID, TrackData } from "js/types";
import type { Writable } from "svelte/store";
import { Time } from "tone/build/esm/core/type/Units";
import Sampler from "js/sampler/sampler";

const samplerStore: Writable<SamplerStore> = writable({});
const { subscribe, update, set } = samplerStore;

interface PlaybackData {
  sampler: Sampler | null;
  startTime: number;
  endTime: number | null;
}

export interface SamplerStore {
  [key: ClipID]: PlaybackData;
}

function stopAudio(clip: Clip, time?: Time) {
  update((store) => {
    store[clip.id].sampler?.stop(time);
    return store;
  });
}

function playAudio(clip: Clip, startTime: Time) {
  update((store) => {
    const sampler = store[clip.id]?.sampler;
    if (!!sampler) {
      const startOffset = store[clip.id].startTime;
      const endTime = store[clip.id].endTime;
      const stopTime = !!endTime ? endTime - startOffset : sampler.duration;

      store[clip.id].sampler
        ?.start(startTime, startOffset)
        .stop(`+${stopTime / sampler.speedFactor}`);
    }
    return store;
  });
}

function setPlaybackRate(clip: Clip, playbackRate: number) {
  update((store) => {
    if (!!store[clip.id].sampler) {
      store[clip.id].sampler!.speedFactor = playbackRate;
    }
    return store;
  });
}

function createSampler(clip: Clip): Sampler | null {
  if (clip.audio_file?.file.url) {
    const audio_url = decodeURI(clip.audio_file.file.url);
    // FIXME: add the project tempo as the third arg here
    const sampler = new Sampler(audio_url, clip.audio_file.bpm);
    sampler.speedFactor = clip.playback_rate;
    return sampler;
  }
  return null;
}

function initialize(tracks: TrackData[]) {
  const newState = tracks.reduce((acc: SamplerStore, track) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = {
        sampler: createSampler(clip),
        startTime: clip.start_time,
        endTime: clip.end_time,
      };
    }
    return acc;
  }, {});
  set(newState);
}

function initializeSamplers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.id] = {
        sampler: createSampler(clip),
        startTime: clip.start_time,
        endTime: clip.end_time,
      };
    }
    return store;
  });
}

function updateSamplers(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      if (!!store[clip.id].sampler) {
        store[clip.id].sampler!.speedFactor = clip.playback_rate;
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
  initialize,
  initializeSamplers,
  updateSamplers,
};
