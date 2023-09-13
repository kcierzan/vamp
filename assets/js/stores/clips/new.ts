import { fileToArrayBuffer } from "../../utils";
import { GrainPlayer } from "tone";
import { ClipData, ClipID, PlayState, SharedMessages, TrackID } from "js/types";
import * as Tone from "tone";
import { Transport } from "tone";
import { pushFile, pushShared } from "js/channels";
import project from "../project";
import { guess } from "web-audio-beat-detector";
import Clip from "js/clip";

async function guessBPM(file: File): Promise<{ bpm: number; offset: number }> {
  const arrayBuf = await fileToArrayBuffer(file);
  const audioBuf = await Tone.getContext().decodeAudioData(arrayBuf);

  try {
    return await guess(audioBuf);
  } catch {
    // FIXME: this effectively skips stretching if bpm guess fails
    return { bpm: Transport.bpm.value, offset: 0 };
  }
}

export async function newClip(
  file: File,
  trackId: TrackID,
  id: ClipID = crypto.randomUUID(),
): Promise<void> {
  const { bpm } = await guessBPM(file);
  // TODO: the server should respond with the ID - we should use the ID to send the binary file
  pushShared(SharedMessages.NewClip, {
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

export function receiveNewClip(newClip: ClipData): void {
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
  project.update((store) => {
    store[trackId].clips[id] = playableClip;
    return store;
  });
}

export function receiveNewBinaryClip(
  message: string,
  payload: ArrayBuffer,
): void {
  const [trackId, clipId] = message.split(":");
  const blob = new Blob([payload]);
  const url = URL.createObjectURL(blob);
  project.update((store) => {
    store[trackId].clips[clipId].grainPlayer = new GrainPlayer(
      url,
    ).toDestination();
    return store;
  });
}
