import vampsetStore from "../vampset";
import * as Tone from "tone";
import { pushShared } from "js/channels";
import { TrackID } from "js/types";

export async function newTrack() {
  await Tone.start();
  console.log("tone has started");
  pushShared("new_track", { id: crypto.randomUUID() });
}

export function receiveNewTrack({ id }: { id: TrackID }) {
  vampsetStore.update((store) => {
    const newTrack = {
      [id]: { id: id, currentlyPlaying: null, playEvent: null, clips: {} },
    };
    return {
      ...store,
      ...newTrack,
    };
  });
}
