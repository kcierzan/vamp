import { Writable, writable } from "svelte/store";
import { Clip, PlayState, TrackID } from "js/types";
import { Draw, Transport } from "tone";
import clips from "js/stores/clips";
import { Time } from "tone/build/esm/core/type/Units";
import { stopAudio } from "./players";

interface Tracks {
  [key: TrackID]: {
    currentlyPlaying: Clip | null;
    currentlyQueued: Clip | null;
    playingEvent: number | null;
    queuedEvent: number | null;
  };
}

const tracks: Writable<Tracks> = writable({});
const { subscribe, update } = tracks;

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
  cancelQueuedEvent(clip.track_id);
  update((store) => {
    const queued = store[clip.track_id].currentlyQueued;
    !!queued && clips.setClipState(queued, PlayState.Stopped);
    clips.setClipState(clip, PlayState.Queued);
    return store;
  });
}

function setTrackClipStatesPlay(clip: Clip, event: number) {
  update((store) => {
    const playing = store[clip.track_id].currentlyPlaying;
    if (!!playing && playing?.id !== clip.id) {
      clips.setClipState(playing, PlayState.Stopped);
    }
    clips.setClipState(clip, PlayState.Playing);
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
      !!playing && stopAudio(playing, time);
      Draw.schedule(() => {
        !!playing && clips.setClipState(playing, PlayState.Stopped);
        store[trackId].currentlyPlaying = null;
        store[trackId].playingEvent = null;
      }, time);
    }, launchTime);
    return store;
  });
}

function setTrackPlayEvent(trackId: TrackID, event: number) {
  update((store) => {
    store[trackId].playingEvent = event;
    return store;
  });
}

function stopCurrentlyPlayingAudio(trackId: TrackID, time: Time | undefined) {
  update((store) => {
    if (!!store[trackId].currentlyPlaying) {
      stopAudio(store[trackId].currentlyPlaying as Clip, time);
    }
    return store;
  });
}

function stopAllTracksAudio() {
  update((store) => {
    for (const track of Object.values(store)) {
      !!track.currentlyPlaying && stopAudio(track.currentlyPlaying, undefined);
    }
    return store;
  });
}

export default {
  subscribe,
  cancelPlayingEvent,
  cancelQueuedEvent,
  setCurrentlyQueued,
  setTrackClipStatesPlay,
  setTrackPlayEvent,
  stopCurrentlyPlayingAudio,
  stopTrack,
  queueClip,
  stopAllTracksAudio,
};
