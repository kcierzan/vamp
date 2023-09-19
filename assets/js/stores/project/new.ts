import projectStore from "js/stores/project";
import transportStore from "js/stores/transport";
import poolStore from "js/stores/pool";
import {
  Song,
  Clip,
  TrackStore,
  TrackClips,
  PlayState,
  TrackData,
} from "js/types";
import { setupGrainPlayer } from "js/clip";

export function setInitialStateFromProps(props: Song) {
  transportStore.setBpm(props.bpm);
  projectStore.set(projectPropsToStore(props));
  poolStore.set(props.audio_files);
}

function projectPropsToStore(props: Song) {
  return props.tracks.reduce((acc: TrackStore, track) => {
    acc[track.id] = {
      ...track,
      currentlyPlaying: null,
      playEvent: null,
      clips: clipsFromProps(track),
    };
    return acc;
  }, {});
}

function clipsFromProps(track: TrackData) {
  return track.audio_clips.reduce((acc: TrackClips, clipProps: Clip) => {
    acc[clipProps.id] = propsToClip(clipProps);
    return acc;
  }, {});
}

function propsToClip(props: Clip) {
  const clip = { ...props, state: PlayState.Stopped };
  setupGrainPlayer(clip);
  return clip;
}
