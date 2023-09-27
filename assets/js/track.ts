import { Transport } from "tone";
import {
  AudioFile,
  PrivateMessages,
  SharedMessages,
  TrackData,
  TrackID,
} from "./types";
import { get } from "svelte/store";
import { pushShared } from "./channels";
import { quantizedTransportTime } from "./utils";
import quantizationStore from "./stores/quantization";
import tracksStore from "js/stores/tracks";
import trackDataStore from "js/stores/track-data";
import playerStore from "js/stores/players";
import clipsStore from "js/stores/clips";

export function pushCreateTrackFromAudioFile(songId: string, audioFile: AudioFile) {
  const trackCount = get(trackDataStore).length;
  const trackWithClipAttrs = {
    song_id: songId,
    name: `Track ${trackCount + 1}`,
    gain: 0.0,
    panning: 0.0,
    audio_clips: [
      {
        name: audioFile.name,
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

export async function pushCreateEmptyTrack(
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

export function pushRemoveTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

export function pushStopTracks(trackIds: TrackID[]): void {
  pushShared(PrivateMessages.StopTrack, { trackIds });
}

export function pushStopAllTracks(): void {
  const trackIds = get(trackDataStore).map((track) => track.id);
  pushStopTracks(trackIds);
}

export function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
  const currentQuantization = get(quantizationStore);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextBarTT = quantizedTransportTime(currentQuantization);
  for (const trackId of trackIds) {
    tracksStore.stopTrack(trackId, nextBarTT);
  }
}

export function receiveRemoveTrack(trackId: TrackID) {
  // TODO: remove clipStates and GrainPlayers
  trackDataStore.removeTrack(trackId);
}

// TODO: add DB properties to the track store!
export function receiveNewTrack(track: TrackData) {
  playerStore.initializeGrainPlayers(...track.audio_clips);
  clipsStore.initializeClipStates(...track.audio_clips);
  trackDataStore.createTrack(track);
}
