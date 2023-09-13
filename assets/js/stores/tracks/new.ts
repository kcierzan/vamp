import project from "../project";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { SharedMessages, TrackID } from "js/types";
import Track from "js/track";

export async function newTrack(songId: string): Promise<void> {
  await Tone.start();
  console.log("tone has started");
  pushShared(SharedMessages.NewTrack, { song_id: songId });
}

export function receiveNewTrack({ id }: { id: TrackID }): void {
  project.update((store) => {
    const newTrack = {
      [id]: new Track(null, null, {}, id),
    };
    return {
      ...store,
      ...newTrack,
    };
  });
}
