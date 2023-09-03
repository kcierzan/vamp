import { pushShared } from "js/channels";
import project from "../project";
import { ClipData, SharedMessages } from "js/types";

export function updateClipProperties(...clips: ClipData[]): void {
  pushShared(SharedMessages.UpdateClipProperties, { clips });
}

export function receiveUpdateClipProperties({
  clips,
}: {
  clips: ClipData[];
}): void {
  project.update((store) => {
    for (const clip of clips) {
      const currentClip = store[clip.trackId].clips[clip.id];
      currentClip.setFromClipData(clip);
    }
    return store;
  });
}
