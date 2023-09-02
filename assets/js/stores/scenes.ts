import type { TrackStore, Scene, SceneStore, TrackID } from "js/types";
import type { Readable } from "svelte/store";
import vampset from "./vampset";
import { PlayState } from "js/types";
import { get, derived } from "svelte/store";
import { tracksToClipArrays } from "../utils";
import { playClips } from "./clips/play";
import { stopTracks } from "./tracks/stop";
import Clip from "js/clip";

function scenesFromTracks(tracks: TrackStore): Scene[] {
  const scenes = [];
  const clipArrays: Clip[][] = tracksToClipArrays(tracks);
  // starting at the highest scene (bottom up)
  for (let row = sceneCount(tracks) - 1; row >= 0; row--) {
    const scene: Scene = {};
    for (const track of clipArrays) {
      const nonemptyTrack = track.find((clip) => !!clip);

      // there is a clip in the scene for this track
      if (track[row]) {
        scene[track[row].trackId] = track[row];
        // there is a clip somewhere in the track
        // so we should stop this track when playing this scene
      } else if (nonemptyTrack) {
        scene[nonemptyTrack.trackId] = null;
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

function sceneCount(tracks: TrackStore): number {
  const clips = Object.values(tracks).map(
    (track) => Object.keys(track.clips).length,
  );
  return Math.max(...clips);
}

const scenes: Readable<SceneStore> = derived(vampset, ($tracks, set) => {
  const sceneArrays: Scene[] = scenesFromTracks($tracks);
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
  playClips(clipsToPlay);
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
