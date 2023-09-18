import { quantizedTransportTime } from "js/utils";
import project from "../project";
import quantization from "../quantization";
import { PrivateMessages, TrackID, TrackStore } from "js/types";
import { get } from "svelte/store";
import { pushShared } from "js/channels";
import { stop } from "js/track";

export function stopTracks(trackIds: TrackID[]): void {
  pushShared(PrivateMessages.StopTrack, { trackIds });
}

export function stopAllTracks(): void {
  const tracks = get(project);
  stopTracks(Object.keys(tracks));
}

export function receiveStopTrack({ trackIds }: { trackIds: TrackID[] }): void {
  const currentQuantization = get(quantization);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the stop event
  const nextBarTT = quantizedTransportTime(currentQuantization);
  const store: TrackStore = get(project);
  for (const trackId of trackIds) {
    stop(store[trackId], nextBarTT);
  }
}
