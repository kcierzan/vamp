import type { Time } from "tone/build/esm/core/type/Units";
import { Draw, GrainPlayer, Transport } from "tone";
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
import project from "./stores/project";
import { get } from "svelte/store";
import quantization from "./stores/quantization";
import transportStore from "./stores/transport";
import { playClip } from "./track";

export function newClipFromAPI(clip: Clip) {
  return setupGrainPlayer({ ...clip, state: PlayState.Stopped });
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
  const serialized = clips.map((clip) => serialize(clip));
  pushShared(SharedMessages.UpdateClips, { clips: serialized });
}

export function playClips(clips: Clip[]) {
  const clipInfos = clips.map((clip) => serialize(clip));
  pushShared(PrivateMessages.PlayClip, { clips: clipInfos });
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
  const store = get(project);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      // TODO: change this to only take a clip
      playClip(store[clip.track_id], clip, 0);
    }
    transportStore.startLocal(nowCompensated);
  } else {
    Transport.scheduleOnce((time) => {
      Draw.schedule(() => {
        for (const clip of clips) {
          playClip(store[clip.track_id], clip, nextDivision);
        }
      }, time);
    }, nowCompensated);
  }
}

function setupGrainPlayer(clip: Clip) {
  if (clip.audio_file?.file.url) {
    const grainPlayer = new GrainPlayer(
      decodeURI(clip.audio_file.file.url),
    ).toDestination();
    setGrainPlayer(clip, grainPlayer);
  }
  return clip;
}

export function serialize(clip: Clip): Clip {
  const { grainPlayer, ...rest } = clip;
  return rest;
}

export function setGrainPlayer(clip: Clip, grainPlayer: GrainPlayer) {
  clip.grainPlayer = grainPlayer;
  clip.grainPlayer.grainSize = 0.2;
  clip.grainPlayer.overlap = 0.05;
  clip.grainPlayer.playbackRate = clip.playback_rate;
}

export function setPlaybackRate(clip: Clip, playbackRate: number) {
  clip.playback_rate = playbackRate;

  if (clip.grainPlayer !== undefined) {
    clip.grainPlayer.playbackRate = playbackRate;
  }
}

export function stopAudio(clip: Clip, time: Time | undefined) {
  clip.grainPlayer?.stop(time);
}

export function playAudio(clip: Clip, startTime: Time, stopTime: Time) {
  clip.grainPlayer?.start(startTime).stop(stopTime);
}

export function isPlayable(clip: Clip): boolean {
  return !!clip.grainPlayer;
}

export function isClip(obj: any): obj is Clip {
  if (!!!obj) return false;
  return "id" in obj && "track_id" in obj && "audio_file" in obj;
}
