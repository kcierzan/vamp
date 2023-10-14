import { Writable, writable } from "svelte/store";
import { Clip, PlayState, TrackData, TrackID } from "js/types";
import { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import samplerStore from "js/stores/samplers";
import clipStore from "js/stores/clips";

export interface TrackState {
  id: TrackID;
  currentlyPlaying: Clip | null;
  currentlyQueued: Clip | null;
  playingEvent: number | null;
  queuedEvent: number | null;
}

export interface TrackStateStore {
  [key: TrackID]: TrackState;
}

const trackPlaybackStore: Writable<TrackStateStore> = writable({});
const { subscribe, update, set } = trackPlaybackStore;
const INIT_TRACK_STATE = {
  currentlyPlaying: null,
  currentlyQueued: null,
  playingEvent: null,
  queuedEvent: null,
};

function cancelPlayingEvent(trackId: TrackID) {
  update((store) => {
    if (store[trackId].playingEvent !== null) {
      Transport.clear(store[trackId].playingEvent as number);
    }
    store[trackId].playingEvent = null;
    return store;
  });
}

function cancelQueuedEvent(trackId: TrackID) {
  update((store) => {
    if (store[trackId].queuedEvent !== null) {
      Transport.clear(store[trackId].queuedEvent as number);
    }
    store[trackId].queuedEvent = null;
    return store;
  });
}

function setCurrentlyQueued(clip: Clip, event: number) {
  update((store) => {
    store[clip.track_id].currentlyQueued = clip;
    store[clip.track_id].queuedEvent = event;
    return store;
  });
}

function queueClip(clip: Clip) {
  clipStore.setClipState(clip, PlayState.Queued);
  cancelQueuedEvent(clip.track_id);
  update((store) => {
    const queued = store[clip.track_id].currentlyQueued;
    !!queued && clipStore.setClipState(queued, PlayState.Stopped);
    return store;
  });
}

function setTrackClipStatesPlay(clip: Clip, event: number) {
  clipStore.setClipState(clip, PlayState.Playing);
  update((store) => {
    const playing = store[clip.track_id].currentlyPlaying;
    if (!!playing && playing?.id !== clip.id) {
      clipStore.setClipState(playing, PlayState.Stopped);
    }
    store[clip.track_id].playingEvent = event;
    store[clip.track_id].currentlyPlaying = clip;
    if (store[clip.track_id].currentlyQueued === clip) {
      store[clip.track_id].currentlyQueued = null;
    }
    return store;
  });
}

function stopTrack(trackId: TrackID, at: Time) {
  update((store) => {
    store[trackId].playingEvent !== null &&
      Transport.clear(store[trackId].playingEvent as number);
    const launchTime = Transport.seconds > (at as number) ? "+0.01" : at;
    Transport.scheduleOnce((time) => {
      const playing = store[trackId].currentlyPlaying;
      !!playing && samplerStore.stopAudio(playing, time);
      Draw.schedule(() => {
        !!playing && clipStore.setClipState(playing, PlayState.Stopped);
        store[trackId].currentlyPlaying = null;
        store[trackId].playingEvent = null;
      }, time);
    }, launchTime);
    return store;
  });
}

function stopCurrentlyPlayingAudio(trackId: TrackID, time: Time | undefined) {
  update((store) => {
    if (!!store[trackId].currentlyPlaying) {
      samplerStore.stopAudio(store[trackId].currentlyPlaying as Clip, time);
    }
    return store;
  });
}

function stopAllTracksAudio() {
  update((store) => {
    for (const track of Object.values(store)) {
      !!track.currentlyPlaying &&
        samplerStore.stopAudio(track.currentlyPlaying, undefined);
    }
    return store;
  });
}

function playTrackClip(clip: Clip, at: Time) {
  const tooLate = Transport.seconds > (at as number);

  queueClip(clip);
  // either the next division or 25ms in the future
  const launchTime = tooLate ? "+0.025" : at;
  // clear events a bit before launchTime
  const clearTime = tooLate ? "+0.0125" : (at as number) - 0.05;
  Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      cancelPlayingEvent(clip.track_id);
    }, time);
    stopCurrentlyPlayingAudio(clip.track_id, time);
  }, clearTime);

  const queuedEvent = Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      loopClip(clip, "1m");
    }, time);
  }, launchTime);
  setCurrentlyQueued(clip, queuedEvent);
}

function loopClip(clip: Clip, every: Time): void {
  const playEvent = Transport.scheduleRepeat(
    (audioContextTime: number) => {
      samplerStore.playAudio(clip, audioContextTime);
    },
    every,
    "+0.0001",
  );
  setTrackClipStatesPlay(clip, playEvent);
}

function setFromProps(tracks: TrackData[]) {
  const state = tracks.reduce((acc: TrackStateStore, track: TrackData) => {
    acc[track.id] = {
      ...INIT_TRACK_STATE,
      id: track.id,
    };
    return acc;
  }, {});
  set(state);
}

function initializeTrackPlaybackState(track: TrackData) {
  update((store) => {
    store[track.id] = {
      ...INIT_TRACK_STATE,
      id: track.id,
    };
    return store;
  });
}

export default {
  subscribe,
  playTrackClip,
  stopTrack,
  stopAllTracksAudio,
  stopCurrentlyPlayingAudio,
  cancelPlayingEvent,
  cancelQueuedEvent,
  setFromProps,
  initializeTrackPlaybackState,
};
