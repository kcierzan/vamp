import { once, pushShared, quantizedTransportTime } from "js/utils";
import trackStore from "../tracks";
import transportStore from "../transport";
import { Clip, ClipID, ClipInfo, PlayState, Track } from "../types";
import * as Tone from "tone";
import { Transport, Draw } from "tone";
import { get } from "svelte/store";


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
  clips: ClipInfo[];
}) {
  const nowWithLatencyCompensation = `+${waitMilliseconds / 1000}`;
  const nextBarTT = quantizedTransportTime("@1m");
  const transport = get(transportStore);
  const fireAt = transport.state === PlayState.Playing ? nextBarTT : 0;
  transport.state === PlayState.Playing && updateUIForQueue(clips);
  transportStore.start(nowWithLatencyCompensation);

  clips.forEach((clip: ClipInfo) => {
    const track = get(trackStore)[clip.trackId];
    // cancel currently playing clip events for the track
    track.playEvent !== null && Transport.clear(track.playEvent);

    const playEvent = loopClip({
      clip: track.clips[clip.id],
      startTime: fireAt,
      endTime: "+1m",
      every: "1m",
    });

    once(
      (time) => {
        // TODO: import this from "stop"?
        stopCurrentTrackAudio({ track, time });
        updateUIForPlay({ clipId: clip.id, playEvent, track, time });
      },
      { at: fireAt },
    );
  });
}

function updateUIForPlay({
  clipId,
  playEvent,
  track,
  time,
}: {
  clipId: ClipID;
  playEvent: number;
  track: Track;
  time: number;
}) {
  Draw.schedule(() => {
    trackStore.update((store) => {
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

function updateUIForQueue(playClips: ClipInfo[]) {
  Draw.schedule(() => {
    trackStore.update((store) => {
      playClips.forEach((clip) => {
        store[clip.trackId].clips[clip.id].queueVisual();
      });
      return store;
    });
  }, Tone.now());
}

function loopClip({
  clip,
  endTime,
  every,
  startTime,
}: {
  clip: Clip;
  endTime: string;
  every: string;
  startTime: number;
}) {
  return Transport.scheduleRepeat(
    (audioContextTime: number) => {
      clip.playAudio(audioContextTime, endTime);
    },
    every,
    startTime,
  );
}

function stopCurrentTrackAudio({
  track,
  time,
}: {
  track: Track;
  time: number;
}) {
  !!track.currentlyPlaying &&
    track.clips[track.currentlyPlaying].stopAudio(time);
}
