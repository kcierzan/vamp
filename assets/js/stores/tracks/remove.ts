import vampsetStore from "../vampset";
import { pushShared } from "js/channels";
import { SharedMessages, TrackID } from "js/types";

export function removeTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

export function receiveRemoveTrack({ trackId }: { trackId: TrackID }): void {
  vampsetStore.update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}
