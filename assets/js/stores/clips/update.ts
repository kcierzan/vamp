import { pushShared } from "../channels";
import vampsetStore from "../vampset";
import { Clip, ClipInfo } from "js/types";

export function updateClipProperties(...clips: Clip[]) {
  pushShared("update_clip_properties", {
    clips: clips.map((clip) => clip.serialize()),
  });
}

export function receiveUpdateClipProperties({ clips }: { clips: ClipInfo[] }) {
  vampsetStore.update((store) => {
    clips.forEach((clip) => {
      const currentClip = store[clip.trackId].clips[clip.id];
      store[clip.trackId].clips[clip.id] = { ...currentClip, ...clip };
      store[clip.trackId].clips[clip.id].setPlaybackRate(clip.playbackRate);
    });
    return store;
  });
}
