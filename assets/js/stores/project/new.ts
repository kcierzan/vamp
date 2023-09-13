import Clip from "js/clip";
import projectStore from "js/stores/project";
import transportStore from "js/stores/transport";
import Track from "js/track";
import { TrackStore, TrackClips } from "js/types";

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

function projectPropsToStore(props: ProjectProps) {
  return props.tracks.reduce((acc: TrackStore, track) => {
    const clips = track.audio_clips.reduce(
      (acc: TrackClips, clip: AudioClipProps) => {
        // TODO: set up the grainPlayers here
        acc[clip.id] = new Clip(
          track.id,
          clip.name,
          clip.type,
          clip.playback_rate,
          0,
          clip.audio_file.bpm,
          clip.id,
        );
        return acc;
      },
      {},
    );
    acc[track.id] = new Track(null, null, clips, track.id);
    return acc;
  }, {});
}

export function setInitialStateFromProps(props: ProjectProps) {
  transportStore.setBpm(props.bpm);
  projectStore.update((_store) => projectPropsToStore(props));
}
