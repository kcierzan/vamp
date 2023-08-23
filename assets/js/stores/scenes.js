import { derived } from "svelte/store";
import tracks from "./tracks";

let scenesValue;

function tracksToClipArrays(tracks) {
  const clipArrays = [];
  for (const track of Object.values(tracks)) {
    const trackArray = [];
    for (const clip of Object.values(track.clips)) {
      trackArray.push(clip);
    }
    clipArrays.push(trackArray);
  }
  return clipArrays;
}

function scenesFromTracks(tracks) {
  const scenes = [];
  const clipArrays = tracksToClipArrays(tracks);
  // starting at the highest scene (bottom up)
  for (let row = sceneCount(tracks) - 1; row >= 0; row--) {
    const scene = {};
    for (const track of clipArrays) {
      const firstClipInTrack = track.find((clip) => !!clip);

      // there is a clip in the scene for this track
      if (track[row]) {
        scene[track[row].trackId] = track[row];
        // there is a clip somewhere in the track
        // so we should stop this track when playing this scene
      } else if (firstClipInTrack) {
        scene[firstClipInTrack.trackId] = null;
      }
    }
    scenes.unshift(scene);
  }
  return scenes;
}

function sceneArraysToStates(sceneArrays) {
  return sceneArrays.map((scene) => {
    const states = [];
    for (const clip of Object.values(scene)) {
      !!clip && states.push(clip.state);
    }
    const uniqueClipStates = new Set(states);
    return uniqueClipStates.size === 1
      ? uniqueClipStates.values().next().value
      : "stopped";
  });
}

function sceneCount(tracks) {
  const clips = Object.values(tracks).map(
    (track) => Object.keys(track.clips).length,
  );
  return Math.max(...clips);
}

const scenes = derived(tracks, ($tracks, set) => {
  const sceneArrays = scenesFromTracks($tracks);
  set({
    states: sceneArraysToStates(sceneArrays),
    scenes: sceneArrays,
  });
});

scenes.subscribe((value) => {
  scenesValue = value;
});

function playScene(index) {
  const { playClips, stopClips } = tracks;
  const scene = scenesValue.scenes[index];
  const clipsToPlay = {};
  const tracksToStop = [];
  for (const [trackId, clip] of Object.entries(scene)) {
    if (clip) {
      clipsToPlay[trackId] = clip.id;
    } else {
      tracksToStop.push(trackId);
    }
  }
  playClips(clipsToPlay);
  stopClips(tracksToStop);
}

export default {
  ...scenes,
  playScene,
};
