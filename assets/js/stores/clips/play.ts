import { quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import transportStore from "../transport";
import { ClipData, PlayState } from "js/types";
import { Draw, Transport } from "tone";
import { get } from "svelte/store";
import { pushShared } from "js/channels";
import Clip from "js/clip";

export function playClips(clips: Clip[]) {
  const clipInfos = clips.map((clip) => clip.serialize());
  updateUIForQueue(clipInfos);
  pushShared("play_clip", { clips: clipInfos });
}

export function receivePlayClips({
  waitMilliseconds,
  clips,
}: {
  waitMilliseconds: number;
  clips: ClipData[];
}) {
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000 + 0.1}`;
  const nextBar = quantizedTransportTime("@1m");
  const transport = get(transportStore);
  const playTime = transport.state === PlayState.Playing ? nextBar : 0;
  transport.state === PlayState.Playing && updateUIForQueue(clips);
  transportStore.start(nowWithLatencyCompensation);

  const store = get(vampsetStore);
  for (const clip of clips) {
    store[clip.trackId].playClip(clip.id, playTime);
  }
}

function updateUIForQueue(playClips: ClipData[]) {
  for (const clip of playClips) {
    Draw.schedule(() => {
      vampsetStore.update((store) => {
        store[clip.trackId].clips[clip.id].queueVisual();
        return store;
      });
    }, "+0.01");
  }
}
