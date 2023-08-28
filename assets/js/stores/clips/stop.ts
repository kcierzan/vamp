import { once, quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import { PlayState, Track, TrackID, TrackStore } from "js/types";
import { Transport, Draw } from "tone";
import { get } from "svelte/store";
import { pushShared } from "js/channels";

export function stopClips(trackIds: TrackID[]) {
  pushShared("stop_clip", { trackIds });
}

export function receiveStopClip({ trackIds }: { trackIds: TrackID[] }) {
  const nextBarTT = quantizedTransportTime("@1m");
  console.log(`STOP NOW: ${Transport.seconds}`);
  console.log(`Stopping at: ${nextBarTT}`);
  const store: TrackStore = get(vampsetStore);

  for (const trackId of trackIds) {
    const track = store[trackId];
    track.playEvent !== null && Transport.clear(track.playEvent);
    once(
      (time: number) => {
        const now = Transport.seconds;
        console.log(`stop callback invoked at ${now}`);
        stopTrackAudio(track, time);
        updateUIForStop(track, time);
      },
      { at: nextBarTT },
    );
  }
}

export function stopTrackAudio(track: Track, time: number) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].stopAudio(time);
}

function updateUIForStop(track: Track, time: number) {
  Draw.schedule(() => {
    console.log(`drawing stop clip at ${time}`);
    vampsetStore.update((store) => {
      for (const clip of Object.values(track.clips)) {
        clip.state = PlayState.Stopped;
      }
      track.currentlyPlaying = null;
      track.playEvent = null;
      return store;
    });
  }, time);
}
