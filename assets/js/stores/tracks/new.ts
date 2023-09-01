import vampsetStore from "../vampset";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { TrackID } from "js/types";
import Track from "js/track";

export async function newTrack() {
  await Tone.start();
  console.log("tone has started");
  pushShared("new_track", { id: crypto.randomUUID() });
}

export function receiveNewTrack({ id }: { id: TrackID }) {
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
