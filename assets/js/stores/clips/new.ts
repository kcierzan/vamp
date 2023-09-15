import { fileToArrayBuffer } from "../../utils";
import { GrainPlayer } from "tone";
import {
  NewClip,
  SharedMessages,
  TrackID,
} from "js/types";
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

export async function newClip(file: File, trackId: TrackID): Promise<void> {
  const { bpm } = await guessBPM(file);
  pushShared(SharedMessages.NewClip, {
    name: file.name,
    type: file.type,
    track_id: trackId,
    playback_rate: Transport.bpm.value / bpm,
  })?.receive("ok", async (id) => {
    const newBuf = await fileToArrayBuffer(file);
    pushFile(
      {
        clip_id: id,
        media_type: file.type,
        size: newBuf.byteLength,
        name: file.name,
        description: "a cool file",
      },
      newBuf,
    );
  });
}

export function receiveNewClip(newClip: NewClip): void {
  const { trackId, name, bpm, id, type, playbackRate, audioFile } = newClip;
  const playableClip = new Clip(
    trackId,
    name,
    type,
    playbackRate,
    0.0,
    bpm,
    id,
  );
  playableClip.grainPlayer = new GrainPlayer(
    decodeURI(audioFile.url),
  ).toDestination();
  playableClip.playbackRate = playbackRate;
  project.update((store) => {
    store[trackId].clips[id] = playableClip;
    return store;
  });
}
