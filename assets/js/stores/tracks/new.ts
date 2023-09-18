import project from "../project";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { SharedMessages } from "js/types";

export async function newTrack(
  songId: string,
  onOk: (res: any) => any = (_res) => {},
): Promise<void> {
  await Tone.start();
  console.log("tone has started");

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
    return {
      ...store,
      [track.id]: {
        id: track.id,
        currentlyPlaying: null,
        playEvent: null,
        clips: {},
      },
    };
  });
}
