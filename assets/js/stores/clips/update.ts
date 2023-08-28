import { pushShared } from "js/channels";
import vampsetStore from "../vampset";
import { PlayableClip, ClipData } from "js/types";

export function updateClipProperties(...clips: PlayableClip[]) {
  pushShared("update_clip_properties", {
    clips: clips.map((clip) => clip.serialize()),
  });
}

export function receiveUpdateClipProperties({ clips }: { clips: ClipData[] }) {
  vampsetStore.update((store) => {
    clips.forEach((clip) => {
      const currentClip = store[clip.trackId].clips[clip.id];
      store[clip.trackId].clips[clip.id] = { ...currentClip, ...clip };
      store[clip.trackId].clips[clip.id].setPlaybackRate(clip.playbackRate);
    });
    return store;
  });
}
