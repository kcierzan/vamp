import { fileToArrayBuffer } from "../../utils";
import { AudioFile, Clip, PlayState, SharedMessages, TrackID } from "js/types";
import * as Tone from "tone";
import { Transport } from "tone";
import { pushFile, pushShared } from "js/channels";
import project from "../project";
import { guess } from "web-audio-beat-detector";
import { setupGrainPlayer } from "js/clip";

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

export function newClipFromPool(
  audio: AudioFile,
  trackId: TrackID,
  index: number,
) {
  pushShared(SharedMessages.NewClip, {
    name: audio.file.file_name,
    type: audio.media_type,
    index: index,
    track_id: trackId,
    audio_file_id: audio.id,
    playback_rate: Transport.bpm.value / audio.bpm,
  });
}

export async function newClip(
  file: File,
  trackId: TrackID,
  index: number,
): Promise<void> {
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

export function receiveNewClip(newClip: Clip): void {
  console.log("INCOMING CLIP", newClip);
  const clip = { ...newClip, state: PlayState.Stopped };
  setupGrainPlayer(clip);
  project.update((store) => {
    store[clip.track_id].clips[clip.id] = clip;
    return store;
  });
}
