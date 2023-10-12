import { Transport } from "tone";
import {
  AudioFile,
  Clip,
  PrivateMessages,
  SharedMessages,
  TrackData,
  TrackID,
} from "./types";
import { get } from "svelte/store";
import { pushShared } from "./channels";
import { quantizedTransportTime } from "./utils";
import quantizationStore from "./stores/quantization";
import trackDataStore from "js/stores/track-data";
import samplerStore from "js/stores/samplers";
import clipsStore from "js/stores/clips";
import trackPlaybackStore from "js/stores/tracks";

function pushCreateTrackFromAudioFile(songId: string, audioFile: AudioFile) {
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
  pushShared(SharedMessages.NewTrack, trackWithClipAttrs);
}

async function pushCreateEmptyTrack(
  songId: string,
  onOk: (res: any) => any = (_res) => {},
): Promise<void> {
  pushShared(SharedMessages.NewTrack, {
    name: "new track",
    gain: 0.0,
    panning: 0.0,
    song_id: songId,
  })?.receive("ok", onOk);
}

function pushCreateTrackFromClip(songId: string, clip: Clip) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [clip],
  };
  pushShared(SharedMessages.NewTrackFromClip, trackWithClipAttrs);
}

function pushRemoveTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

function pushStopTracks(trackIds: TrackID[]): void {
  pushShared(PrivateMessages.StopTrack, { trackIds });
}

function pushStopAllTracks(): void {
  const trackIds = get(trackDataStore).map((track) => track.id);
  pushStopTracks(trackIds);
}

function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextBarTT = quantizedTransportTime(currentQuantization);
  for (const trackId of trackIds) {
    trackPlaybackStore.stopTrack(trackId, nextBarTT);
  }
}

function receiveRemoveTrack(trackId: TrackID) {
  // TODO: remove clipStates and GrainPlayers
  trackPlaybackStore.stopCurrentlyPlayingAudio(trackId, undefined);
  trackPlaybackStore.cancelPlayingEvent(trackId);
  trackPlaybackStore.cancelQueuedEvent(trackId);
  trackDataStore.removeTrack(trackId);
}

// TODO: add DB properties to the track store!
function receiveNewTrack(track: TrackData) {
  trackPlaybackStore.initializeTrackPlaybackState(track);
  samplerStore.initializeSamplers(...track.audio_clips);
  clipsStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}

export default {
  push: {
    createFromAudioFile: pushCreateTrackFromAudioFile,
    createFromClip: pushCreateTrackFromClip,
    createEmpty: pushCreateEmptyTrack,
    remove: pushRemoveTrack,
    stop: pushStopTracks,
    stopAll: pushStopAllTracks,
  },
  receive: {
    stop: receiveStopTrack,
    remove: receiveRemoveTrack,
    new: receiveNewTrack,
  },
};
