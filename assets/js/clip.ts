import type { Time } from "tone/build/esm/core/type/Units";
import { GrainPlayer } from "tone";
import { TrackID, PlayState, ClipID } from "./types";

export interface Audio {
  readonly id: number;
  bpm: number;
  url: string;
  filename: string;
  readonly size: number;
  readonly media_type: string;
}

export interface Clip {
  readonly id: ClipID;
  readonly trackId: TrackID;
  name: string;
  playbackRate: number;
  grainPlayer?: GrainPlayer;
  state: PlayState;
  audio?: Audio;
}

export function setAudio(clip: Clip, audio: Audio) {
  const grainPlayer = new GrainPlayer(decodeURI(audio.url)).toDestination()
  clip.audio = audio;
  setGrainPlayer(clip, grainPlayer);
}

export function serialize(clip: Clip): Clip {
  const { grainPlayer, ...rest } = clip;
  return rest
}

export function setGrainPlayer(clip: Clip, grainPlayer: GrainPlayer) {
  clip.grainPlayer = grainPlayer;
  clip.grainPlayer.grainSize = 0.2;
  clip.grainPlayer.overlap = 0.05;
  clip.grainPlayer.playbackRate = clip.playbackRate;
}

export function setPlaybackRate(clip: Clip, playbackRate: number) {
  clip.playbackRate = playbackRate;

  if (clip.grainPlayer !== undefined) {
    clip.grainPlayer.playbackRate = playbackRate;
  }
}

export function stopAudio(clip: Clip, time: Time | undefined) {
  clip.grainPlayer?.stop(time);
}

export function playAudio(clip: Clip, startTime: Time, stopTime: Time) {
  clip.grainPlayer?.start(startTime).stop(stopTime);
}

export function isPlayable(clip: Clip): boolean {
  return !!clip.grainPlayer
}
