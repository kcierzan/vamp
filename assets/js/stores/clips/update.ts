import { pushShared } from "js/channels";
import vampsetStore from "../vampset";
import { ClipData } from "js/types";

export function updateClipProperties(...clips: ClipData[]) {
  pushShared("update_clip_properties", { clips });
}

export function receiveUpdateClipProperties({ clips }: { clips: ClipData[] }) {
  vampsetStore.update((store) => {
    for (const clip of clips) {
      const currentClip = store[clip.trackId].clips[clip.id];
      currentClip.setFromClipData(clip);
    }
    return store;
  });
}
