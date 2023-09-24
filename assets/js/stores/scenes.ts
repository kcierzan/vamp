import type { Scene, SceneStore, TrackID } from "js/types";
import type { Readable } from "svelte/store";
import { Clip, PlayState } from "js/types";
import { get, derived } from "svelte/store";
import { tracksToClipArrays } from "../utils";
import { playClips } from "js/clip";
import { stopTracks } from "js/track";
import clipsStore from "js/stores/clips"
import type { ClipStore } from "js/stores/clips";

function scenesFromTracks(tracks: ClipStore): Scene[] {
  const scenes = [];
  const clipArrays: Clip[][] = tracksToClipArrays(tracks);
  // starting at the highest scene (bottom up)
  for (let row = sceneCount(clipArrays) - 1; row >= 0; row--) {
    const scene: Scene = {};
    for (const track of clipArrays) {
      const nonemptyTrack = track.find((clip) => !!clip);

      // there is a clip in the scene for this track
      if (track[row]) {
        scene[track[row].track_id] = track[row];
        // there is a clip somewhere in the track
        // so we should stop this track when playing this scene
      } else if (nonemptyTrack) {
        scene[nonemptyTrack.track_id] = null;
      }
    }
    scenes.unshift(scene);
  }
  return scenes;
}

function sceneArraysToStates(sceneArrays: Scene[]): PlayState[] {
  return sceneArrays.map((scene) => {
    const states = [];
    for (const clip of Object.values(scene)) {
      !!clip && states.push(clip.state);
    }
    const uniqueClipStates = new Set(states);
    return uniqueClipStates.size === 1
      ? uniqueClipStates.values().next().value
      : PlayState.Stopped;
  });
}

function sceneCount(clipArrays: Clip[][]): number {
  const clips = clipArrays.map(
    (track) => track.length,
  );
  return Math.max(...clips);
}

const scenes: Readable<SceneStore> = derived(clipsStore, ($clips, set) => {
  const sceneArrays: Scene[] = scenesFromTracks($clips);
  set({
    states: sceneArraysToStates(sceneArrays),
    scenes: sceneArrays,
  });
});

function playScene(index: number): void {
  const scenesValue = get(scenes);

  if (!scenesValue) return;
  const scene = scenesValue.scenes[index];
  const clipsToPlay: Clip[] = [];
  const tracksToStop: TrackID[] = [];
  for (const [trackId, clip] of Object.entries(scene)) {
    if (clip) {
      clipsToPlay.push(clip);
    } else {
      tracksToStop.push(trackId);
    }
  }
  playClips(...clipsToPlay);
  stopTracks(tracksToStop);
}

function stopScene(index: number): void {
  const scenesValue = get(scenes);
  if (!scenesValue) return;
  const scene = scenesValue.scenes[index];
  const tracksToStop: TrackID[] = [];
  for (const trackId of Object.keys(scene)) {
    tracksToStop.push(trackId);
  }
  stopTracks(tracksToStop);
}

export default {
  ...scenes,
  playScene,
  stopScene,
};
