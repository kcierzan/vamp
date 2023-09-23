import { pushShared } from "js/channels";
import project from "../project";
import { Clip, PlayState, SharedMessages } from "js/types";
import { setupGrainPlayer } from "js/clip";

export function updateClipProperties(...clips: Clip[]): void {
  pushShared(SharedMessages.UpdateClips, { clips });
}

export function receiveUpdateClipProperties({
  clips,
}: {
  clips: Clip[];
}): void {
  project.update((store) => {
    for (const clip of clips) {
      store[clip.track_id].clips[clip.id] = setupGrainPlayer({...clip, state: PlayState.Stopped});
    }
    return store;
  });
}
