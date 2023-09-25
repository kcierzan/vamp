import { Writable, writable } from "svelte/store";
import { Clip, PlayState, TrackData, TrackID } from "js/types";
import { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import playerStore from "./players";

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

const tracksStore: Writable<TrackStateStore> = writable({});
const { subscribe, update, set } = tracksStore;

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
  playerStore.setClipState(clip, PlayState.Queued);
  cancelQueuedEvent(clip.track_id);
  update((store) => {
    const queued = store[clip.track_id].currentlyQueued;
    !!queued && playerStore.setClipState(queued, PlayState.Stopped);
    return store;
  });
}

function setTrackClipStatesPlay(clip: Clip, event: number) {
  playerStore.setClipState(clip, PlayState.Playing);
  update((store) => {
    const playing = store[clip.track_id].currentlyPlaying;
    if (!!playing && playing?.id !== clip.id) {
      playerStore.setClipState(playing, PlayState.Stopped);
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
      !!playing && playerStore.stopAudio(playing, time);
      Draw.schedule(() => {
        !!playing && playerStore.setClipState(playing, PlayState.Stopped);
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
      playerStore.stopAudio(store[trackId].currentlyPlaying as Clip, time);
    }
    return store;
  });
}

function stopAllTracksAudio() {
  update((store) => {
    for (const track of Object.values(store)) {
      !!track.currentlyPlaying &&
        playerStore.stopAudio(track.currentlyPlaying, undefined);
    }
    return store;
  });
}

function playClip(clip: Clip, at: Time) {
  const tooLate = Transport.seconds > (at as number);
  queueClip(clip);
  // either the next division or 50ms in the future
  const launchTime = tooLate ? "+0.05" : at;
  // 50ms before the next division or immediately
  const clearTime = tooLate ? 0 : (at as number) - 0.05;
  Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      cancelPlayingEvent(clip.track_id);
    }, time);
  }, clearTime);

  const queuedEvent = Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      loopClip(clip, "+1m", "1m");
    }, time);
    stopCurrentlyPlayingAudio(clip.track_id, time);
  }, launchTime);
  setCurrentlyQueued(clip, queuedEvent);
}

function loopClip(clip: Clip, endTime: Time, every: Time): void {
  const playEvent = Transport.scheduleRepeat(
    (audioContextTime: number) => {
      playerStore.playAudio(clip, audioContextTime, endTime);
    },
    every,
    "+0.005",
  );
  setTrackClipStatesPlay(clip, playEvent);
}

function setFromProps(tracks: TrackData[]) {
  const state = tracks.reduce((acc: TrackStateStore, track: TrackData) => {
    acc[track.id] = {
      id: track.id,
      currentlyPlaying: null,
      currentlyQueued: null,
      playingEvent: null,
      queuedEvent: null,
    };
    return acc;
  }, {});
  set(state);
}

export default {
  subscribe,
  playClip,
  stopTrack,
  stopAllTracksAudio,
  stopCurrentlyPlayingAudio,
  cancelPlayingEvent,
  cancelQueuedEvent,
  setFromProps
};
