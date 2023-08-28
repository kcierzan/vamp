import type {
  TrackStore,
  Scene,
  PlayableClip,
  SceneStore,
  TrackID,
} from "js/types";
import type { Readable } from "svelte/store";
import vampset from "./vampset";
import { PlayState } from "js/types";
import { get, derived } from "svelte/store";
import { tracksToClipArrays } from "../utils";
import { playClips } from "./clips/play";
import { stopClips } from "./clips/stop";

function scenesFromTracks(tracks: TrackStore) {
  const scenes = [];
  const clipArrays: PlayableClip[][] = tracksToClipArrays(tracks);
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

function sceneArraysToStates(sceneArrays: Scene[]) {
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

function sceneCount(tracks: TrackStore) {
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

function playScene(index: number) {
  const scenesValue = get(scenes);

  if (!scenesValue) return;
  const scene = scenesValue.scenes[index];
  const clipsToPlay: PlayableClip[] = [];
  const tracksToStop: TrackID[] = [];
  for (const [trackId, clip] of Object.entries(scene)) {
    if (clip) {
      clipsToPlay.push(clip);
    } else {
      tracksToStop.push(trackId);
    }
  }
  playClips(clipsToPlay);
  stopClips(tracksToStop);
}

function stopScene(index: number) {
  const scenesValue = get(scenes);
  if (!scenesValue) return;
  const scene = scenesValue.scenes[index];
  const tracksToStop: TrackID[] = [];
  for (const trackId of Object.keys(scene)) {
    tracksToStop.push(trackId);
  }
  stopClips(tracksToStop);
}

export default {
  ...scenes,
  playScene,
  stopScene,
};