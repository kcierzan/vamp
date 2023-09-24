import { Draw, Transport } from "tone";
import {
  AudioFile,
  Clip,
  PlayState,
  PrivateMessages,
  SharedMessages,
  TrackID,
} from "./types";
import { pushFile, pushShared } from "./channels";
import { fileToArrayBuffer, guessBPM, quantizedTransportTime } from "./utils";
import { get } from "svelte/store";
import quantization from "./stores/quantization";
import transportStore from "./stores/transport";
import clipStore from "js/stores/clips";
import { setupGrainPlayer } from "js/stores/players";
import { setPlaybackRate as setRate } from "js/stores/players";

export function newClipFromAPI(clip: Clip) {
  const newClip = { ...clip, state: PlayState.Stopped };
  setupGrainPlayer(newClip);
  return newClip;
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
    index: index,
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

export function updateClipProperties(...clips: Clip[]): void {
  pushShared(SharedMessages.UpdateClips, { clips });
}

export function playClips(...clips: Clip[]) {
  pushShared(PrivateMessages.PlayClip, { clips });
}

// FIXME: lots of calls to `get` probably makes this slow.
// Consider moving this to a derived store that derives from
// quantization, transport, and project.
export function receivePlayClips({
  waitMilliseconds,
  clips,
}: {
  waitMilliseconds: number;
  clips: Clip[];
}) {
  const nowCompensated = `+${waitMilliseconds / 1000 + 0.1}`;
  const currentQuantization = get(quantization);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the play event
  // (different clients will have different quantization values)
  const nextDivision = quantizedTransportTime(currentQuantization);
  const transport = get(transportStore);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      clipStore.playClip(clip, 0);
    }
    transportStore.startLocal(nowCompensated);
  } else {
    // fire the event with delay compensation
    Transport.scheduleOnce((time) => {
      Draw.schedule(() => {
        for (const clip of clips) {
          clipStore.playClip(clip, nextDivision);
        }
      }, time);
    }, nowCompensated);
  }
}

export function setPlaybackRate(clip: Clip, playbackRate: number) {
  clip.playback_rate = playbackRate;
  setRate(clip, playbackRate);
}

export function isClip(obj: any): obj is Clip {
  if (!!!obj) return false;
  return "id" in obj && "track_id" in obj && "audio_file" in obj;
}
