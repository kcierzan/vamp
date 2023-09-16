import type { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import { ClipID, PlayState, TrackClips, TrackID } from "./types";
import project from "js/stores/project";
import * as Tone from "tone";
import { playAudio, stopAudio } from "js/clip";

export interface Track {
  readonly id: TrackID;
  currentlyPlaying: ClipID | null;
  clips: TrackClips;
  playEvent: number | null;
}

export function playClip(track: Track, clipId: ClipID, at: Time) {
  Draw.schedule(() => {
    project.update((store) => {
      store[track.id].clips[clipId].state = PlayState.Queued;
      return store;
    });
  }, Tone.now());

  // HACK: sometimes we are too late when attempting scheduling
  // and we end up trying to schedule an event in the past.
  // Rather than fail entirely, we schedule ASAP...
  const launchTime = Transport.seconds > (at as number) ? "+0.01" : at;
  Transport.scheduleOnce((time) => {
    stopTrackAudio(track, time);
    Draw.schedule(() => {
      updateUIForPlay(track, clipId);
      loopClip(track, clipId, "+1m", "1m");
    }, time);
  }, launchTime);
}

export function stop(track: Track, at: Time) {
  const launchTime = Transport.seconds > (at as number) ? "+0.01" : at;
  Transport.scheduleOnce((time) => {
    stopTrackAudio(track, time);
    Draw.schedule(() => {
      track.playEvent !== null && Transport.clear(track.playEvent);
    }, time - 0.1);
    Draw.schedule(() => {
      updateUIForStop(track);
    }, time);
  }, launchTime);
}

export function stopTrackAudio(track: Track, time: Time | undefined): void {
  if (track.currentlyPlaying && track.clips[track.currentlyPlaying]) {
    stopAudio(track.clips[track.currentlyPlaying], time);
  }
}

function loopClip(
  track: Track,
  clipId: ClipID,
  endTime: Time,
  every: Time,
): void {
  track.playEvent !== null && Transport.clear(track.playEvent);
  track.playEvent = Transport.scheduleRepeat(
    (audioContextTime: number) => {
      playAudio(track.clips[clipId], audioContextTime, endTime);
    },
    every,
    "+0.01",
  );
}

function updateUIForStop(track: Track): void {
  project.update((store) => {
    if (!!track.currentlyPlaying) {
      store[track.id].clips[track.currentlyPlaying].state = PlayState.Stopped;
    }
    track.currentlyPlaying = null;
    track.playEvent = null;
    return store;
  });
}

function updateUIForPlay(track: Track, clipId: ClipID): void {
  project.update((store) => {
    if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
      store[track.id].clips[track.currentlyPlaying].state = PlayState.Stopped;
    }
    store[track.id].clips[clipId].state = PlayState.Playing;
    track.currentlyPlaying = clipId;
    return store;
  });
}
