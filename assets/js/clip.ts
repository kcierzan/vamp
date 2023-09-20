import type { Time } from "tone/build/esm/core/type/Units";
import { GrainPlayer } from "tone";
import { Clip } from "./types";

export function setupGrainPlayer(clip: Clip) {
  if (clip.audio_file?.file.url) {
    const grainPlayer = new GrainPlayer(decodeURI(clip.audio_file.file.url)).toDestination()
    setGrainPlayer(clip, grainPlayer);
  }
  return clip;
}

export function serialize(clip: Clip): Clip {
  const { grainPlayer, ...rest } = clip;
  return rest
}

export function setGrainPlayer(clip: Clip, grainPlayer: GrainPlayer) {
  clip.grainPlayer = grainPlayer;
  clip.grainPlayer.grainSize = 0.2;
  clip.grainPlayer.overlap = 0.05;
  clip.grainPlayer.playbackRate = clip.playback_rate;
}

export function setPlaybackRate(clip: Clip, playbackRate: number) {
  clip.playback_rate = playbackRate;

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
