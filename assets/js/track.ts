import type { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import {
  AudioFile,
  Clip,
  ClipID,
  PlayState,
  PrivateMessages,
  SharedMessages,
  Track,
  TrackID,
  TrackStore,
} from "./types";
import project from "js/stores/project";
import * as Tone from "tone";
import { playAudio, stopAudio } from "js/clip";
import { get } from "svelte/store";
import { pushShared } from "./channels";
import quantization from "./stores/quantization";
import { quantizedTransportTime } from "./utils";

export function newTrackFromPoolItem(songId: string, audioFile: AudioFile) {
  const trackCount = Object.keys(get(project)).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [
      {
        name: audioFile.name,
        type: audioFile.media_type,
        playback_rate: audioFile.bpm
          ? Transport.bpm.value / audioFile.bpm
          : 1.0,
        index: 0,
        audio_file_id: audioFile.id,
      },
    ],
  };
  pushShared(SharedMessages.NewTrack, trackWithClipAttrs);
}

export async function newTrack(
  songId: string,
  onOk: (res: any) => any = (_res) => { },
): Promise<void> {
  pushShared(SharedMessages.NewTrack, {
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    song_id: songId,
  })?.receive("ok", onOk);
}

export function removeTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

export function stopTracks(trackIds: TrackID[]): void {
  pushShared(PrivateMessages.StopTrack, { trackIds });
}

export function stopAllTracks(): void {
  const tracks = get(project);
  stopTracks(Object.keys(tracks));
}

export function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
  const currentQuantization = get(quantization);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextBarTT = quantizedTransportTime(currentQuantization);
  const store: TrackStore = get(project);
  for (const trackId of trackIds) {
    stop(store[trackId], nextBarTT);
  }
}

export function playClip(track: Track, clip: Clip, at: Time) {
  track.playEvent !== null && Transport.clear(track.playEvent);
  Draw.schedule(() => {
    project.setClipState(clip, PlayState.Queued);
  }, Tone.now());

  // HACK: sometimes we are too late when attempting scheduling
  // and we end up trying to schedule an event in the past.
  // Rather than fail entirely, we schedule ASAP...
  const launchTime = Transport.seconds > (at as number) ? "+0.01" : at;
  Transport.scheduleOnce((time) => {
    Draw.schedule(() => {
      updateUIForPlay(track, clip);
      loopClip(track, clip.id, "+1m", "1m");
    }, time);
    stopTrackAudio(track, time);
  }, launchTime);
}

export function stop(track: Track, at: Time) {
  track.playEvent !== null && Transport.clear(track.playEvent);
  const launchTime = Transport.seconds > (at as number) ? "+0.01" : at;
  Transport.scheduleOnce((time) => {
    stopTrackAudio(track, time);
    Draw.schedule(() => {
      updateUIForStop(track);
    }, time);
  }, launchTime);
}

export function stopTrackAudio(track: Track, time: Time | undefined): void {
  if (track.currentlyPlaying && track.clips[track.currentlyPlaying]) {
    stopAudio(track.clips[track.currentlyPlaying], time)
  }
}

function loopClip(
  track: Track,
  clipId: ClipID,
  endTime: Time,
  every: Time,
): void {
  // track.playEvent !== null && Transport.clear(track.playEvent);
  const playEvent = Transport.scheduleRepeat(
    (audioContextTime: number) => {
      playAudio(track.clips[clipId], audioContextTime, endTime);
    },
    every,
    "+0.005",
  );
  project.setTrackPlayEvent(track, playEvent);
}

function updateUIForStop(track: Track): void {
  if (!!track.currentlyPlaying) {
    project.setClipState(
      track.clips[track.currentlyPlaying],
      PlayState.Stopped,
    );
  }
  project.setTrackStopped(track);
}

function updateUIForPlay(track: Track, clip: Clip): void {
  if (track.currentlyPlaying && track.currentlyPlaying !== clip.id) {
    project.setClipState(
      track.clips[track.currentlyPlaying],
      PlayState.Stopped,
    );
  }
  project.setTrackPlaying(track, clip);
}
