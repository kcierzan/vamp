import project from "../project";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { SharedMessages, TrackID } from "js/types";

export async function newTrack(songId: string): Promise<void> {
  await Tone.start();
  console.log("tone has started");
  pushShared(SharedMessages.NewTrack, { song_id: songId });
}

export function receiveNewTrack({ id }: { id: TrackID }): void {
  project.update((store) => {
    const newTrack = {
      [id]: { id, currentlyPlaying: null, playEvent: null, clips: {} },
    };
    return {
      ...store,
      ...newTrack,
    };
  });
}
