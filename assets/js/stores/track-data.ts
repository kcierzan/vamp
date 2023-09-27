import { Clip, TrackData, TrackID } from "js/types";
import { Writable, writable } from "svelte/store";
import tracksStore from "js/stores/tracks";

const trackData: Writable<TrackData[]> = writable([]);
const { subscribe, update, set } = trackData;

function createTrack(track: TrackData) {
  update((store) => {
    store.push(track);
    return store;
  });
}

function removeTrack(trackId: TrackID) {
  tracksStore.stopCurrentlyPlayingAudio(trackId, undefined);
  tracksStore.cancelPlayingEvent(trackId);
  tracksStore.cancelQueuedEvent(trackId);
  update((store) => {
    const indexToRemove = store.findIndex((track) => track.id === trackId);
    store.splice(indexToRemove, 1);
    return store;
  });
}

function setFromProps(trackProps: TrackData[]) {
  set(trackProps);
}

// PERF: this should create new clip objects for any clips passed in
// and should preserve any unmodified clip objects
function createClips(...clips: Clip[]) {
  update((store) => {
    for (const newClip of clips) {
      const trackIndex = store.findIndex(
        (track: TrackData) => track.id === newClip.track_id,
      );
      const unmodifiedClips = store[trackIndex].audio_clips.filter(
        (clip) => clip.id !== newClip.id,
      );
      const newTrack = {
        ...store[trackIndex],
        audio_clips: [...unmodifiedClips, newClip],
      };
      store.splice(trackIndex, 1, newTrack);
    }
    return store;
  });
}

function deleteClip(clip: Clip) {
  update((store) => {
    const track = store.find((track) => track.id === clip.track_id);
    if (!!track) {
      const indexToRemove = track.audio_clips.findIndex(
        (existingClip) => existingClip.id === clip.id,
      );
      track.audio_clips.splice(indexToRemove, 1);
    }
    return store;
  });
}

export default {
  subscribe,
  createTrack,
  removeTrack,
  setFromProps,
  createClips,
  deleteClip,
};