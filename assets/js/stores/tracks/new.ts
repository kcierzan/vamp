import project from "../project";
import { pushShared } from "js/channels";
import { Clip, PlayState, SharedMessages, TrackClips } from "js/types";
import { get } from "svelte/store";
import { setupGrainPlayer } from "js/clip";

export function newTrackFromPoolItem(attrs: any) {
  pushShared(SharedMessages.NewTrack, attrs);
}

export async function newTrack(
  songId: string,
  onOk: (res: any) => any = (_res) => { },
): Promise<void> {
  pushShared(SharedMessages.NewTrack, {
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    song_id: songId,
  })?.receive("ok", onOk);
}

export function receiveNewTrack(track: any): void {
  console.log("incoming track", track);
  project.update((store) => {
    const clips = track.audio_clips.reduce((acc: TrackClips, clip: Clip) => {
      const newClip = { ...clip, state: PlayState.Stopped };
      setupGrainPlayer(newClip);
      acc[clip.id] = newClip;
      return acc;
    }, {});
    return { ...store, [track.id]: { ...track, clips: clips } };
  });

  console.log("project store", get(project));
}
