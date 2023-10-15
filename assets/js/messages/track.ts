import { Transport } from "tone";
import {
  AudioFile,
  Clip,
  PrivateMessage,
  SharedMessage,
  TrackData,
  TrackID,
} from "js/types";
import { get } from "svelte/store";
import { pushMessage, registerChannelListener } from "js/channels";
import { quantizedTransportTime } from "js/utils";
import quantizationStore from "js/stores/quantization";
import trackDataStore from "js/stores/track-data";
import samplerStore from "js/stores/samplers";
import clipsStore from "js/stores/clips";
import trackPlaybackStore from "js/stores/tracks";

function createFromAudioFile(songId: string, audioFile: AudioFile) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [
      {
        name: audioFile.file.file_name,
        type: audioFile.media_type,
        playback_rate: audioFile.bpm
          ? Transport.bpm.value / audioFile.bpm
          : 1.0,
        index: 0,
        audio_file_id: audioFile.id,
      },
    ],
  };
  pushMessage(SharedMessage.NewTrack, trackWithClipAttrs);
}

async function createEmpty(
  songId: string,
  onOk: (res: any) => any = (_res) => {},
): Promise<void> {
  pushMessage(SharedMessage.NewTrack, {
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    song_id: songId,
  })?.receive("ok", onOk);
}

function createFromClip(songId: string, clip: Clip) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [clip],
  };
  pushMessage(SharedMessage.NewTrackFromClip, trackWithClipAttrs);
}

function remove(id: TrackID) {
  pushMessage(SharedMessage.RemoveTrack, { id });
}

function stop(trackIds: TrackID[]): void {
  pushMessage(SharedMessage.StopTrack, { trackIds });
}

function stopAll(): void {
  const trackIds = get(trackDataStore).map((track) => track.id);
  stop(trackIds);
}

registerChannelListener(
  PrivateMessage.StopTrack,
  function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
    const currentQuantization = get(quantizationStore);
    // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
    const nextBarTT = quantizedTransportTime(currentQuantization);
    for (const trackId of trackIds) {
      trackPlaybackStore.stopTrack(trackId, nextBarTT);
    }
  },
);

registerChannelListener(
  SharedMessage.RemoveTrack,
  function receiveRemoveTrack(trackId: TrackID) {
    // TODO: remove clipStates and GrainPlayers
    trackPlaybackStore.stopCurrentlyPlayingAudio(trackId, undefined);
    trackPlaybackStore.cancelPlayingEvent(trackId);
    trackPlaybackStore.cancelQueuedEvent(trackId);
    trackDataStore.removeTrack(trackId);
  },
);

// TODO: add DB properties to the track store!
function receiveNewTrack(track: TrackData) {
  trackPlaybackStore.initializeTrackPlaybackState(track);
  samplerStore.initializeSamplers(...track.audio_clips);
  clipsStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

registerChannelListener(SharedMessage.NewTrack, receiveNewTrack);
registerChannelListener(SharedMessage.NewTrackFromClip, receiveNewTrack);

export default {
    createFromAudioFile,
    createFromClip,
    createEmpty,
    remove,
    stop,
    stopAll,
};
