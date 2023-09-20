import { pushShared } from "js/channels";
import project from "../project";
import { Clip, SharedMessages } from "js/types";
import { setupGrainPlayer } from "js/clip";

export function updateClipProperties(...clips: Clip[]): void {
  pushShared(SharedMessages.UpdateClipProperties, { clips });
}

export function receiveUpdateClipProperties({
  clips,
}: {
  clips: Clip[];
}): void {
  project.update((store) => {
    for (const clip of clips) {
      store[clip.track_id].clips[clip.id] = setupGrainPlayer(clip);
    }
    return store;
  });
}
