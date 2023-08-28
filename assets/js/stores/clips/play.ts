import { once, quantizedTransportTime } from "js/utils";
import vampsetStore from "../vampset";
import transportStore from "../transport";
import { PlayableClip, ClipID, ClipData, PlayState, Track } from "js/types";
import * as Tone from "tone";
import { Transport, Draw } from "tone";
import { get } from "svelte/store";
import { pushShared } from "../channels";
import { stopTrackAudio } from "./stop";

export function playClips(clips: PlayableClip[]) {
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
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
  const nextBarTT = quantizedTransportTime("@1m");
  const transport = get(transportStore);
  const fireAt = transport.state === PlayState.Playing ? nextBarTT : 0;
  transport.state === PlayState.Playing && updateUIForQueue(clips);
  transportStore.start(nowWithLatencyCompensation);

  clips.forEach((clip: ClipData) => {
    const track = get(vampsetStore)[clip.trackId];
    // cancel currently playing clip events for the track
    track.playEvent !== null && Transport.clear(track.playEvent);
    const playEvent = loopClip(track.clips[clip.id], "+1m", "1m", fireAt);
    once(
      (time) => {
        stopTrackAudio(track, time);
        updateUIForPlay(clip.id, playEvent, track, time);
      },
      { at: fireAt },
    );
  });
}

function updateUIForPlay(
  clipId: ClipID,
  playEvent: number,
  track: Track,
  time: number,
) {
  Draw.schedule(() => {
    vampsetStore.update((store) => {
      // if there is a clip playing for this track, set it to `stopped`
      if (track.currentlyPlaying && track.currentlyPlaying !== clipId) {
        store[track.id].clips[track.currentlyPlaying].stopVisual();
      }

      // set the target clip to a playing state
      store[track.id].clips[clipId].playVisual();
      store[track.id].currentlyPlaying = clipId;
      store[track.id].playEvent = playEvent;
      return store;
    });
  }, time);
}

function updateUIForQueue(playClips: ClipData[]) {
  Draw.schedule(() => {
    vampsetStore.update((store) => {
      playClips.forEach((clip) => {
        store[clip.trackId].clips[clip.id].queueVisual();
      });
      return store;
    });
  }, Tone.now());
}

function loopClip(
  clip: PlayableClip,
  endTime: string,
  every: string,
  startTime: number | string,
) {
  return Transport.scheduleRepeat(
    (audioContextTime: number) => {
      clip.playAudio(audioContextTime, endTime);
    },
    every,
    startTime,
  );
}
