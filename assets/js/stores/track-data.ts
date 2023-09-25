import { Clip, Song, TrackData, TrackID } from "js/types";
import { Writable, writable } from "svelte/store";
import tracksStore from "js/stores/tracks"

const trackData: Writable<TrackData[]> = writable([]);
const { subscribe, update, set } = trackData;

function createTrack(track: TrackData) {
  update((store) => {
    store.push(track);
    return store;
  });
}

function removeTrack(trackId: TrackID) {
  // TODO: move these to playback state stores
  tracksStore.stopCurrentlyPlayingAudio(trackId, undefined);
  tracksStore.cancelPlayingEvent(trackId);
  tracksStore.cancelQueuedEvent(trackId);
  update((store) => {
    return store.filter((track) => track.id !== trackId);
  });
}

function setFromProps(props: Song) {
  set(props.tracks);
}

function setClips(...clips: Clip[]) {
  // TODO: setup clip states
  update((store) => {
    for (const newClip of clips) {
      const track = store.find((track) => track.id === newClip.track_id);
      if (!!track) {
        const newClips = track.audio_clips.filter(
          (clip) => clip.id !== newClip.id,
        );
        track.audio_clips = [...newClips, newClip];
      }
    }
    return store;
  });
}

function deleteClip(clip: Clip) {
  update((store) => {
    const track = store.find((track) => track.id === clip.track_id);
    if (!!track) {
      track.audio_clips = track?.audio_clips.filter(
        (clip) => clip.id !== clip.id,
      );
    }
    return store;
  });
}

export default {
  subscribe,
  createTrack,
  removeTrack,
  setFromProps,
  setClips,
  deleteClip,
};
