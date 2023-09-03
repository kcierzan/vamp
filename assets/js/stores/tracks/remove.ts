import project from "../project";
import { pushShared } from "js/channels";
import { SharedMessages, TrackID } from "js/types";

export function removeTrack(id: TrackID) {
  pushShared(SharedMessages.RemoveTrack, { id });
}

export function receiveRemoveTrack({ trackId }: { trackId: TrackID }): void {
  project.update((store) => {
    const { [trackId]: _, ...remainingTracks } = store;
    return remainingTracks;
  });
}
