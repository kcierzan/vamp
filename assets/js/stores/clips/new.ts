import { fileToArrayBuffer } from "../../utils";
import { GrainPlayer } from "tone";
import { ClipID, NewClip, PlayState, TrackID } from "js/types";
import * as Tone from "tone";
import { Transport } from "tone";
import { pushFile, pushShared } from "js/channels";
import vampsetStore from "../vampset";
import { guess } from "web-audio-beat-detector";
import Clip from "js/clip";

async function guessBPM(file: File) {
  const arrayBuf = await fileToArrayBuffer(file);
  const audioBuf = await Tone.getContext().decodeAudioData(arrayBuf);
  const result = await guess(audioBuf);
  return result;
}

export async function newClip(
  file: File,
  trackId: TrackID,
  id: ClipID = crypto.randomUUID(),
) {
  const { bpm } = await guessBPM(file);
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
  const newbuf = await fileToArrayBuffer(file);
  pushFile(id, trackId, newbuf);
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
