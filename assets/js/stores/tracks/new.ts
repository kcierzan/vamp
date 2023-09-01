import vampsetStore from "../vampset";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { SharedMessages, TrackID } from "js/types";
import Track from "js/track";

export async function newTrack(): Promise<void> {
  await Tone.start();
  console.log("tone has started");
  pushShared(SharedMessages.NewTrack, { id: crypto.randomUUID() });
}

export function receiveNewTrack({ id }: { id: TrackID }): void {
  vampsetStore.update((store) => {
    const newTrack = {
      [id]: new Track(null, null, {}, id),
    };
    return {
      ...store,
      ...newTrack,
    };
  });
}
