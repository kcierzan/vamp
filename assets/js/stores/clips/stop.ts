import { quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import { PrivateMessages, TrackID, TrackStore } from "js/types";
import { get } from "svelte/store";
import { pushShared } from "js/channels";

export function stopClips(
  trackIds: TrackID[],
  immediate: boolean = false,
): void {
  pushShared(PrivateMessages.StopClip, { trackIds, immediate });
}

export function stopAllClips(): void {
  const tracks = get(vampsetStore);
  stopClips(Object.keys(tracks), true);
}

export function receiveStopClip({
  trackIds,
  immediate,
}: {
  trackIds: TrackID[];
  immediate: boolean;
}): void {
  const nextBarTT = quantizedTransportTime("@1m");
  const store: TrackStore = get(vampsetStore);
  for (const trackId of trackIds) {
    store[trackId].stop(nextBarTT, immediate);
  }
}
