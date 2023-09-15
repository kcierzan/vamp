import Clip from "js/clip";
import projectStore from "js/stores/project";
import transportStore from "js/stores/transport";
import Track from "js/track";
import { TrackStore, TrackClips } from "js/types";
import { GrainPlayer } from "tone";

interface AudioFileProps {
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
    acc[track.id] = new Track(null, null, clips, track.id);
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
  const newClip = new Clip(
    track.id,
    props.name,
    props.type,
    props.playback_rate,
    0,
    props.audio_file?.bpm,
    props.id,
  );
  newClip.grainPlayer = new GrainPlayer(
    decodeURI(props.audio_file?.file.url),
  ).toDestination();
  return newClip;
}
