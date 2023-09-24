import { Transport } from "tone";
import {
  AudioFile,
  PrivateMessages,
  SharedMessages,
  TrackID,
} from "./types";
import { get } from "svelte/store";
import { pushShared } from "./channels";
import quantization from "./stores/quantization";
import { quantizedTransportTime, tracksToClipArrays } from "./utils";
import tracks from "js/stores/tracks";
import clips from "js/stores/clips";

export function newTrackFromPoolItem(songId: string, audioFile: AudioFile) {

  const trackCount = tracksToClipArrays(get(clips)).length;
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

export async function newTrack(
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

export function removeTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

export function stopTracks(trackIds: TrackID[]): void {
  pushShared(PrivateMessages.StopTrack, { trackIds });
}

export function stopAllTracks(): void {
  const trackIds = tracksToClipArrays(get(clips)).map((track) => track[0].track_id)
  stopTracks(trackIds);
}

export function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
  const currentQuantization = get(quantization);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextBarTT = quantizedTransportTime(currentQuantization);
  for (const trackId of trackIds) {
    tracks.stopTrack(trackId, nextBarTT);
  }
}
