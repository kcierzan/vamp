import type { Writable } from "svelte/store";
import { Clip, ClipID, PlayState, Song, TrackID } from "js/types";
import { writable } from "svelte/store";
import { newClipFromAPI } from "js/clip";
import { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import tracks from "js/stores/tracks";
import playerStore from "./players";

export interface ClipStore {
  [key: ClipID]: Clip;
}
const clips: Writable<ClipStore> = writable({});

const { subscribe, update, set } = clips;

function setClips(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.id] = newClipFromAPI(clip);
    }
    return store;
  });
}

function setClipState(clip: Clip, state: PlayState) {
  update((store) => {
    store[clip.id] = { ...clip, state };
    return store;
  });
}

function removeTrack(trackId: TrackID) {
  update((store) => {
    const filtered = Object.entries(store).filter(([_clipId, clip]) => {
      return clip.track_id !== trackId
    })
    return Object.fromEntries(filtered);
  });
}

function deleteClip(clip: Clip) {
  update((store) => {
    const { [clip.id]: _clip, ...rest } = store
    return rest;
  });
}

function playClip(clip: Clip, at: Time) {
  const tooLate = Transport.seconds > (at as number);
  tracks.queueClip(clip);
  // either the next division or 50ms in the future
  const launchTime = tooLate ? "+0.05" : at;
  // 50ms before the next division or immediately
  const clearTime = tooLate ? 0 : (at as number) - 0.05;
  Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      tracks.cancelPlayingEvent(clip.track_id);
    }, time);
  }, clearTime);

  const queuedEvent = Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      loopClip(clip, "+1m", "1m");
    }, time);
    tracks.stopCurrentlyPlayingAudio(clip.track_id, time);
  }, launchTime);
  tracks.setCurrentlyQueued(clip, queuedEvent)
}

function loopClip(
  clip: Clip,
  endTime: Time,
  every: Time,
): void {
  const playEvent = Transport.scheduleRepeat(
    (audioContextTime: number) => {
      playerStore.playAudio(clip, audioContextTime, endTime);
    },
    every,
    "+0.005",
  );
  tracks.setTrackClipStatesPlay(clip, playEvent);
}

export default {
  subscribe,
  set,
  playClip,
  setClips,
  setClipState,
  removeTrack,
  deleteClip,
};
