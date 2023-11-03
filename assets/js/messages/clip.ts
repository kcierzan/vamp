import { Draw, Transport, now } from "tone";
import {
  AudioFile,
  Clip,
  PlayState,
  SongPlaybackMessage,
  SongDataMessage,
  TrackData,
  TrackID,
} from "js/types";
import {
  clipStore,
  trackPlaybackStore,
  trackDataStore,
  transportStore,
  quantizationStore,
  samplerStore,
} from "js/stores/index";
import { dataChannel, playbackChannel, userChannel } from "js/channels/index";
import { quantizedTransportTime, transportNow } from "js/utils";
import { get } from "svelte/store";
import { Time } from "tone/build/esm/core/type/Units";

function createFromPool(audio: AudioFile, trackId: TrackID, index: number) {
  dataChannel.push(SongDataMessage.NewClip, {
    name: audio.file.file_name,
    type: audio.media_type,
    index: index,
    track_id: trackId,
    audio_file_id: audio.id,
    playback_rate: Transport.bpm.value / audio.bpm,
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
  dataChannel.push(SongDataMessage.UpdateClips, { clips });
}

function playClips(...clips: Clip[]) {
  playbackChannel.push(SongPlaybackMessage.PlayClip, { clips });
}

userChannel.registerListener(
  SongPlaybackMessage.PlayClip,
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
      beginTrackClipLoop(clips, 0, transportNow())
      transportStore.startLocal(nowCompensated);
    } else {
      // fire the event with delay compensation
      beginTrackClipLoop(clips, nextDivision, nowCompensated)
    }
  },
);

function beginTrackClipLoop(clips: Clip[], division: Time, at: Time) {
  Transport.scheduleOnce((time) => {
    for (const clip of clips) {
      Draw.schedule(() => {
        trackPlaybackStore.playTrackClip(clip, division);
      }, time);
    }
  }, at);
}

dataChannel.registerListener(
  SongDataMessage.NewClip,
  function receiveNewClip(clip: Clip) {
    samplerStore.initializeSamplers(clip);
    clipStore.initializeClipStates(clip);
    trackDataStore.createClips(clip);
  },
);

dataChannel.registerListener(
  SongDataMessage.UpdateClips,
  function receiveUpdateClips({ clips }: { clips: Clip[] }) {
    samplerStore.updateSamplers(...clips);
    trackDataStore.createClips(...clips);
  },
);

export default {
  createFromPool,
  playClips,
  updateClips,
  stretchClipsToBpm,
};
