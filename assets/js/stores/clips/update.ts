import { pushShared } from "js/channels";
import project from "../project";
import { SharedMessages } from "js/types";
import { Clip, setAudio } from "js/clip";

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
      const { audio, ...newClip } = clip
      if (!!audio) setAudio(newClip, audio);
      store[clip.trackId].clips[clip.id] = newClip;
    }
    return store;
  });
}
