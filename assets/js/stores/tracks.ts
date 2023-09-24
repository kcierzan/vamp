import { Writable, writable } from "svelte/store";
import { Clip, PlayState, Song, TrackData, TrackID } from "js/types";
import { Draw, Transport } from "tone";
import clipsStore, { ClipStore } from "js/stores/clips";
import { Time } from "tone/build/esm/core/type/Units";
import playerStore from "./players";
import { newClipFromAPI } from "js/clip";

interface Tracks {
  [key: TrackID]: {
    currentlyPlaying: Clip | null;
    currentlyQueued: Clip | null;
    playingEvent: number | null;
    queuedEvent: number | null;
  };
}

const tracksStore: Writable<Tracks> = writable({});
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
  cancelQueuedEvent(clip.track_id);
  update((store) => {
    const queued = store[clip.track_id].currentlyQueued;
    !!queued && clipsStore.setClipState(queued, PlayState.Stopped);
    clipsStore.setClipState(clip, PlayState.Queued);
    return store;
  });
}

function setTrackClipStatesPlay(clip: Clip, event: number) {
  update((store) => {
    const playing = store[clip.track_id].currentlyPlaying;
    if (!!playing && playing?.id !== clip.id) {
      clipsStore.setClipState(playing, PlayState.Stopped);
    }
    clipsStore.setClipState(clip, PlayState.Playing);
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
        !!playing && clipsStore.setClipState(playing, PlayState.Stopped);
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
      playerStore.stopAudio(store[trackId].currentlyPlaying as Clip, time);
    }
    return store;
  });
}

function stopAllTracksAudio() {
  update((store) => {
    for (const track of Object.values(store)) {
      !!track.currentlyPlaying && playerStore.stopAudio(track.currentlyPlaying, undefined);
    }
    return store;
  });
}

function createTrack(track: TrackData) {
  update((store) => {
    store[track.id] = {
      currentlyPlaying: null,
      currentlyQueued: null,
      playingEvent: null,
      queuedEvent: null,
    };
    return store;
  });
}

function removeTrack(trackId: TrackID) {
  stopCurrentlyPlayingAudio(trackId, undefined);
  cancelPlayingEvent(trackId);
  cancelQueuedEvent(trackId);
  update((store) => {
    delete store[trackId];
    return store;
  });
}

function setTracksFromProps(props: Song) {
  const tracks = props.tracks.reduce((acc: Tracks, track: TrackData) => {
    acc[track.id] = {
      currentlyPlaying: null,
      currentlyQueued: null,
      playingEvent: null,
      queuedEvent: null,
    };
    return acc;
  }, {});
  const newClips = props.tracks.reduce((acc: ClipStore, track: TrackData) => {
    for (const clip of track.audio_clips) {
      acc[clip.id] = newClipFromAPI(clip);
    }
    return acc;
  }, {});
  set(tracks);
  console.log("initial tracks", tracks)
  clipsStore.set(newClips);
  console.log("initial clips", newClips)
}

export default {
  subscribe,
  set,
  cancelPlayingEvent,
  cancelQueuedEvent,
  setCurrentlyQueued,
  setTrackClipStatesPlay,
  setTrackPlayEvent,
  stopCurrentlyPlayingAudio,
  stopTrack,
  queueClip,
  stopAllTracksAudio,
  createTrack,
  removeTrack,
  setTracksFromProps,
};
