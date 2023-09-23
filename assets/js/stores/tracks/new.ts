import project from "../project";
import { pushShared } from "js/channels";
import {
  AudioFile,
  Clip,
  PlayState,
  SharedMessages,
  TrackClips,
  TrackData,
} from "js/types";
import { get } from "svelte/store";
import { setupGrainPlayer } from "js/clip";
import { Transport } from "tone";

export function newTrackFromPoolItem(songId: string, audioFile: AudioFile) {
  const trackCount = Object.keys(get(project)).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [
      {
        name: audioFile.name,
        type: audioFile.media_type,
        playback_rate: audioFile.bpm
          ? Transport.bpm.value / audioFile.bpm
          : 1.0,
        index: 0,
        audio_file_id: audioFile.id,
      },
    ],
  };
  pushShared(SharedMessages.NewTrack, trackWithClipAttrs);
}

export async function newTrack(
  songId: string,
  onOk: (res: any) => any = (_res) => {},
): Promise<void> {
  pushShared(SharedMessages.NewTrack, {
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    song_id: songId,
  })?.receive("ok", onOk);
}

export function receiveNewTrack(track: TrackData): void {
  project.update((store) => {
    const clips = track.audio_clips.reduce((acc: TrackClips, clip: Clip) => {
      acc[clip.id] = setupGrainPlayer({ ...clip, state: PlayState.Stopped });
      return acc;
    }, {});
    return {
      ...store,
      [track.id]: { ...track, playEvent: null, currentlyPlaying: null, clips },
    };
  });
}
