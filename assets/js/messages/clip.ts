import { Draw, Transport } from "tone";
import {
  AudioFile,
  Clip,
  PlayState,
  PrivateMessage,
  SharedMessage,
  TrackData,
  TrackID,
} from "js/types";
import { pushFile, pushMessage, registerChannelListener } from "js/channels";
import { fileToArrayBuffer, guessBPM, quantizedTransportTime } from "js/utils";
import { get } from "svelte/store";
import quantizationStore from "js/stores/quantization";
import transportStore from "js/stores/transport";
import samplerStore from "js/stores/samplers";
import trackPlaybackStore from "js/stores/tracks";
import trackDataStore from "js/stores/track-data";
import clipStore from "js/stores/clips";

function createFromPool(audio: AudioFile, trackId: TrackID, index: number) {
  pushMessage(SharedMessage.NewClip, {
    name: audio.file.file_name,
    type: audio.media_type,
    index: index,
    track_id: trackId,
    audio_file_id: audio.id,
    playback_rate: Transport.bpm.value / audio.bpm,
  });
}

async function createFromFile(
  file: File,
  trackId: TrackID,
  songId: string,
  index: number,
): Promise<void> {
  const { bpm } = await guessBPM(file);
  pushMessage(SharedMessage.NewClip, {
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

function stretchClipsToBpm(tracks: TrackData[], bpm: number) {
  const clipsToStretch: Clip[] = [];
  for (const track of tracks) {
    for (const clip of track.audio_clips) {
      if (!!clip.audio_file) {
        const rate = bpm / clip.audio_file.bpm;
        // optimistically change rate locally first
        samplerStore.setPlaybackRate(clip, rate);
        clipsToStretch.push({ ...clip, playback_rate: rate });
      }
    }
  }
  updateClips(...clipsToStretch);
}

function updateClips(...clips: Clip[]): void {
  pushMessage(SharedMessage.UpdateClips, { clips });
}

function playClips(...clips: Clip[]) {
  pushMessage(SharedMessage.PlayClip, { clips });
}

registerChannelListener(
  PrivateMessage.PlayClip,
  function receivePlayClips({
    waitMilliseconds,
    clips,
  }: {
    waitMilliseconds: number;
    clips: Clip[];
  }) {
    const nowCompensated = `+${waitMilliseconds / 1000}`;
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
  },
);

registerChannelListener(
  SharedMessage.NewClip,
  function receiveNewClip(clip: Clip) {
    samplerStore.initializeSamplers(clip);
    clipStore.initializeClipStates(clip);
    trackDataStore.createClips(clip);
  },
);

registerChannelListener(
  SharedMessage.UpdateClips,
  function receiveUpdateClips({ clips }: { clips: Clip[] }) {
    samplerStore.updateSamplers(...clips);
    trackDataStore.createClips(...clips);
  },
);

export default {
  createFromPool,
  createFromFile,
  playClips,
  updateClips,
  stretchClipsToBpm,
};
