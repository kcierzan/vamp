import { get } from "svelte/store";
import { Transport } from "tone";
import {
  AudioFile,
  Clip,
  SongDataMessage,
  SongPlaybackMessage,
  TrackData,
  TrackID,
} from "js/types";
import {
  quantizationStore,
  trackDataStore,
  clipStore,
  trackPlaybackStore,
  samplerStore,
} from "js/stores/index";
import { dataChannel, playbackChannel, userChannel } from "js/channels/index";
import { quantizedTransportTime } from "js/utils";

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
  dataChannel.push(SongDataMessage.NewTrack, trackWithClipAttrs);
}

async function createEmpty(
  songId: string,
  onOk: (res: any) => any = (_res) => { },
): Promise<void> {
  dataChannel
    .push(SongDataMessage.NewTrack, {
      name: "new track",
      gain: 0.0,
      panning: 0.0,
      song_id: songId,
    })
    ?.receive("ok", onOk);
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
  dataChannel.push(SongDataMessage.NewTrackFromClip, trackWithClipAttrs);
}

function remove(id: TrackID) {
  dataChannel.push(SongDataMessage.RemoveTrack, { id });
}

function stop(trackIds: TrackID[]): void {
  playbackChannel.push(SongPlaybackMessage.StopTrack, { trackIds });
}

function stopAll(): void {
  const trackIds = get(trackDataStore).map((track) => track.id);
  stop(trackIds);
}

userChannel.registerListener(
  SongPlaybackMessage.StopTrack,
  function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
    const currentQuantization = get(quantizationStore);
    // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
    const nextBarTT = quantizedTransportTime(currentQuantization);
    for (const trackId of trackIds) {
      trackPlaybackStore.stopTrack(trackId, nextBarTT);
    }
  },
);

dataChannel.registerListener(
  SongDataMessage.RemoveTrack,
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
  clipStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

dataChannel.registerListener(SongDataMessage.NewTrack, receiveNewTrack);
dataChannel.registerListener(SongDataMessage.NewTrackFromClip, receiveNewTrack);

export default {
  createFromAudioFile,
  createFromClip,
  createEmpty,
  remove,
  stop,
  stopAll,
};
