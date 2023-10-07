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
import quantizationStore from "./stores/quantization";
import transportStore from "./stores/transport";
import playerStore from "js/stores/players";
import trackPlaybackStore from "js/stores/tracks";
import trackDataStore from "js/stores/track-data";
import clipStore from "js/stores/clips";

function pushCreateClipFromPool(
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

async function pushCreateClipFromFile(
  file: File,
  trackId: TrackID,
  songId: string,
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
        song_id: songId,
        bpm,
      },
      newBuf,
    );
  });
}

function pushUpdateClips(...clips: Clip[]): void {
  pushShared(SharedMessages.UpdateClips, { clips });
}

function pushPlayClips(...clips: Clip[]) {
  pushShared(PrivateMessages.PlayClip, { clips });
}

// FIXME: lots of calls to `get` probably makes this slow.
// Consider moving this to a derived store that derives from
// quantization, transport, and project.
function receivePlayClips({
  waitMilliseconds,
  clips,
}: {
  waitMilliseconds: number;
  clips: Clip[];
}) {
  const nowCompensated = `+${waitMilliseconds / 1000 + 0.1}`;
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the play event
  // (different clients will have different quantization values)
  const nextDivision = quantizedTransportTime(currentQuantization);
  const transport = get(transportStore);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      trackPlaybackStore.playTrackClip(clip, 0);
    }
    transportStore.startLocal(nowCompensated);
  } else {
    // fire the event with delay compensation
    Transport.scheduleOnce((time) => {
      for (const clip of clips) {
        Draw.schedule(() => {
          trackPlaybackStore.playTrackClip(clip, nextDivision);
        }, time);
      }
    }, nowCompensated);
  }
}

function receiveNewClip(clip: Clip) {
  playerStore.initializeGrainPlayers(clip);
  clipStore.initializeClipStates(clip);
  trackDataStore.createClips(clip);
}

function receiveUpdateClips(...clips: Clip[]) {
  playerStore.updateGrainPlayers(...clips);
  trackDataStore.createClips(...clips);
}

export function isClip(obj: any): obj is Clip {
  if (!!!obj) return false;
  return (
    "id" in obj &&
    "track_id" in obj &&
    "audio_file" in obj &&
    !obj.isDndShadowItem
  );
}

export default {
  push: {
    createFromPool: pushCreateClipFromPool,
    createFromFile: pushCreateClipFromFile,
    playClips: pushPlayClips,
    updateClips: pushUpdateClips,
  },
  receive: {
    updateClips: receiveUpdateClips,
    new: receiveNewClip,
    playClips: receivePlayClips,
  },
};
