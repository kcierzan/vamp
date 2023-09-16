import projectStore from "js/stores/project";
import transportStore from "js/stores/transport";
import { TrackStore, TrackClips, PlayState } from "js/types";
import { setAudio, type Audio, Clip } from "js/clip"

interface AudioFileProps {
  id: number;
  name: string;
  size: number;
  description: string;
  media_type: string;
  bpm: number;
  file: {
    file_name: string;
    url: string;
  };
}

interface AudioClipProps {
  id: string;
  name: string;
  playback_rate: number;
  type: string;
  audio_file: AudioFileProps;
}

interface TrackProps {
  id: string;
  gain: number;
  panning: number;
  name: string;
  audio_clips: AudioClipProps[];
}

interface ProjectProps {
  bpm: number;
  tracks: TrackProps[];
  description: string;
  time_signature: string;
  title: string;
}

export function setInitialStateFromProps(props: ProjectProps) {
  transportStore.setBpm(props.bpm);
  projectStore.update((_store) => projectPropsToStore(props));
}

function projectPropsToStore(props: ProjectProps) {
  return props.tracks.reduce((acc: TrackStore, track) => {
    const clips = clipsFromProps(track);
    acc[track.id] = {
      id: track.id,
      currentlyPlaying: null,
      playEvent: null,
      clips,
    };
    return acc;
  }, {});
}

function clipsFromProps(track: TrackProps) {
  return track.audio_clips.reduce(
    (acc: TrackClips, clipProps: AudioClipProps) => {
      acc[clipProps.id] = propsToClip(clipProps, track);
      return acc;
    },
    {},
  );
}

function propsToClip(props: AudioClipProps, track: TrackProps) {
  const audio: Audio = {
    id: props.audio_file.id,
    bpm: props.audio_file.bpm,
    filename: props.audio_file.file.file_name,
    size: props.audio_file.size,
    url: props.audio_file.file.url,
    media_type: props.audio_file.media_type
  }
  const clip: Clip = {
    id: props.id,
    trackId: track.id,
    name: props.name,
    playbackRate: props.playback_rate,
    state: PlayState.Stopped,
  }
  setAudio(clip, audio);
  return clip;
}
