import { once, quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import { Track, TrackID, TrackStore } from "js/types";
import { Transport, Draw } from "tone";
import { get } from "svelte/store";
import { pushShared } from "js/channels";

export function stopClips(trackIds: TrackID[], immediate: boolean = false) {
  pushShared("stop_clip", { trackIds, immediate });
}

export function receiveStopClip({
  trackIds,
  immediate,
}: {
  trackIds: TrackID[];
  immediate: boolean;
}) {
  const nextBarTT = quantizedTransportTime("@1m");
  const store: TrackStore = get(vampsetStore);
  for (const trackId of trackIds) {
    const track = store[trackId];
    track.playEvent !== null && Transport.clear(track.playEvent);
    if (immediate) {
      stopTrackAudio(track, "+0.01");
      updateUIForStop(track, "+0.2");
    } else {
      once(
        (time: number) => {
          stopTrackAudio(track, time);
          updateUIForStop(track, time);
        },
        { at: nextBarTT },
      );
    }
  }
}

export function stopAllClips() {
  const tracks = get(vampsetStore);
  stopClips(Object.keys(tracks), true);
}

export function stopTrackAudio(track: Track, time: number | string) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].stopAudio(time);
}

function updateUIForStop(track: Track, time: number | string) {
  Draw.schedule(() => {
    vampsetStore.update((store) => {
      // for (const clip of Object.values(track.clips)) {
      //   clip.stopVisual();
      // }
      track.currentlyPlaying && track.clips[track.currentlyPlaying].stopVisual()
      track.currentlyPlaying = null;
      track.playEvent = null;
      return store;
    });
  }, time);
}
