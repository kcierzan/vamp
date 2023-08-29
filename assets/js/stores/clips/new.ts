import { fileToArrayBuffer } from "../../utils";
import { GrainPlayer } from "tone";
import { ClipID, NewClip, PlayState, TrackID } from "js/types";
import { Transport } from "tone";
import { pushFile, pushShared } from "js/channels";
import vampsetStore from "../vampset";
import Clip from "js/clip";

export async function newClip(
  file: File,
  trackId: TrackID,
  bpm: number,
  id: ClipID = crypto.randomUUID(),
) {
  pushShared("new_clip", {
    id: id,
    name: file.name,
    type: file.type,
    trackId: trackId,
    state: PlayState.Stopped,
    currentTime: 0.0,
    playbackRate: Transport.bpm.value / bpm,
    bpm,
  });
  const buffer = await fileToArrayBuffer(file);
  // FIXME: make sure this message gets sent after the initial
  // clip push message. Maybe wait for a reply?
  pushFile(id, trackId, buffer);
}

export function receiveNewClip(newClip: NewClip) {
  const { trackId, name, bpm, id, state, type, playbackRate } = newClip;
  const playableClip = new Clip(
    trackId,
    name,
    type,
    playbackRate,
    0.0,
    bpm,
    id,
    state,
  );
  vampsetStore.update((store) => {
    store[trackId].clips[id] = playableClip;
    return store;
  });
}

export function receiveNewBinaryClip(message: string, payload: ArrayBuffer) {
  console.log("got clip audio");
  const [trackId, clipId] = message.split(":");
  const blob = new Blob([payload]);
  const url = URL.createObjectURL(blob);
  vampsetStore.update((store) => {
    store[trackId].clips[clipId].grainPlayer = new GrainPlayer(
      url,
    ).toDestination();
    return store;
  });
}
