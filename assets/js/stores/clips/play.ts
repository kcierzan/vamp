import { quantizedTransportTime } from "js/utils";
import project from "../project";
import transportStore from "../transport";
import quantization from "../quantization";
import { Clip, PlayState, PrivateMessages } from "js/types";
import { Draw, Transport } from "tone";
import { get } from "svelte/store";
import { pushShared } from "js/channels";
import { serialize } from "js/clip";
import { playClip } from "js/track";

export function playClips(clips: Clip[]) {
  const clipInfos = clips.map((clip) => serialize(clip));
  pushShared(PrivateMessages.PlayClip, { clips: clipInfos });
}

// FIXME: lots of calls to `get` probably makes this slow.
// Consider moving this to a derived store that derives from
// quantization, transport, and project.
export function receivePlayClips({
  waitMilliseconds,
  clips,
}: {
  waitMilliseconds: number;
  clips: Clip[];
}) {
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000 + 0.1}`;
  const currentQuantization = get(quantization);
  // FIXME: Either make quantization settings e2e reactive or pass a time w/ the play event
  // (different clients will have different quantization values)
  const nextDivision = quantizedTransportTime(currentQuantization);
  const transport = get(transportStore);
  const store = get(project);

  if (transport.state === PlayState.Stopped) {
    for (const clip of clips) {
      playClip(store[clip.track_id], clip.id, 0);
    }
    transportStore.startLocal(nowWithLatencyCompensation);
  } else {
    Transport.scheduleOnce((time) => {
      Draw.schedule(() => {
        for (const clip of clips) {
          playClip(store[clip.track_id], clip.id, nextDivision);
        }
      }, time);
    }, nowWithLatencyCompensation);
  }
}
