import type { Writable } from "svelte/store";
import {
  Clip,
  PlayState,
  Song,
  Track,
  TrackClips,
  TrackData,
  TrackID,
  TrackStore,
} from "js/types";
import { writable } from "svelte/store";
import { newClipFromAPI } from "js/clip";

const project: Writable<TrackStore> = writable({});

const { subscribe, update, set } = project;

// TODO: move this into stores/clips
function setClips(...clips: Clip[]) {
  update((store) => {
    for (const clip of clips) {
      store[clip.track_id].clips[clip.id] = newClipFromAPI(clip);
    }
    return store;
  });
}

function setFromProps(props: Song) {
  set(
    props.tracks.reduce((acc: TrackStore, track) => {
      acc[track.id] = {
        ...track,
        currentlyPlaying: null,
        playEvent: null,
        clips: clipsFromProps(track),
      };
      return acc;
    }, {}),
  );
}

function clipsFromProps(track: TrackData) {
  return track.audio_clips.reduce((acc: TrackClips, clipProps: Clip) => {
    acc[clipProps.id] = newClipFromAPI(clipProps);
    return acc;
  }, {});
}

function setClipState(clip: Clip, state: PlayState) {
  update((store) => {
    store[clip.track_id].clips[clip.id] = {...clip, state}
    return store;
  });
}

// TODO: move this into stores/tracks
function setTrack(track: TrackData) {
  update((store) => {
    const clips = track.audio_clips.reduce((acc: TrackClips, clip: Clip) => {
      acc[clip.id] = newClipFromAPI(clip);
      return acc;
    }, {});
    return {
      ...store,
      [track.id]: { ...track, playEvent: null, currentlyPlaying: null, clips },
    };
  });
}

// TODO: move this into stores/tracks
function removeTrack(trackId: TrackID) {
  update((store) => {
    delete store[trackId];
    return store;
  });
}

function setTrackStopped(track: Track) {
  update((store) => {
    store[track.id].currentlyPlaying = null;
    store[track.id].playEvent = null;
    return store;
  });
}

function setTrackPlaying(track: Track, clip: Clip) {
  update((store) => {
    setClipState(clip, PlayState.Playing);
    store[track.id].currentlyPlaying = clip.id;
    return store;
  });
}

function setTrackPlayEvent(track: Track, event: number) {
  update((store) => {
    store[track.id].playEvent = event;
    return store;
  });
}

function deleteClip(clip: Clip) {
  update((store) => {
    delete store[clip.track_id].clips[clip.id];
    return store;
  });
}

export default {
  subscribe,
  setFromProps,
  setClips,
  setClipState,
  setTrack,
  removeTrack,
  setTrackStopped,
  setTrackPlaying,
  setTrackPlayEvent,
  deleteClip,
};
