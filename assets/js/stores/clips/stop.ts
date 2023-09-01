import { quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import { TrackID, TrackStore } from "js/types";
import { get } from "svelte/store";
import { pushShared } from "js/channels";

export function stopClips(trackIds: TrackID[], immediate: boolean = false) {
  pushShared("stop_clip", { trackIds, immediate });
}

export function stopAllClips() {
  const tracks = get(vampsetStore);
  stopClips(Object.keys(tracks), true);
}

export function receiveStopClip({
  trackIds,
  immediate,
}: {
  trackIds: TrackID[];
  immediate: boolean;
}) {
  const nextBarTT = quantizedTransportTime("@1m");
  const store: TrackStore = get(vampsetStore);
  for (const trackId of trackIds) {
    store[trackId].stop(nextBarTT, immediate)
  }
}
