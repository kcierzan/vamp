import project from "../project";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { SharedMessages, TrackData } from "js/types";

export async function newTrack(
  trackAttrs: TrackData,
  onOk: (res: any) => any = (_res) => {},
): Promise<void> {
  await Tone.start();
  console.log("tone has started");
  pushShared(SharedMessages.NewTrack, trackAttrs)?.receive("ok", onOk);
}

export function receiveNewTrack(track: any): void {
  console.log("incoming track", track);
  project.update((store) => {
    return {
      ...store,
      [track.id]: { id: track.id, currentlyPlaying: null, playEvent: null, clips: {} },
    };
  });
}
