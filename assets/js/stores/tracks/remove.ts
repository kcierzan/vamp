import vampsetStore from "../vampset"
import { pushShared } from "../channels"
import { TrackID } from "js/types";

export function removeTrack(id: TrackID) {
  pushShared("remove_track", { id });
}

export function receiveRemoveTrack({ trackId }: { trackId: TrackID }) {
  vampsetStore.update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}

