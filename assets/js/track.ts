import type { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import { ClipID, TrackClips, TrackID } from "./types";
import vampsetStore from "js/stores/vampset";
// import * as Tone from "tone";

export default class Track {
  public currentlyPlaying: ClipID | null;
  public clips: TrackClips;
  private _playEvent: number | null;
  private _id: TrackID;

  constructor(
    currentlyPlaying: ClipID | null,
    playEvent: number | null,
    clips: TrackClips,
    id: TrackID = crypto.randomUUID(),
  ) {
    this.currentlyPlaying = currentlyPlaying;
    this.clips = clips;
    this._playEvent = playEvent;
    this._id = id;
  }

  public get id() {
    return this._id;
  }

  public playClip(clipId: ClipID, at: Time): void {
    this.clearPlayEvent();
    this.loopClip(clipId, at, "+1m", "1m");
    Transport.scheduleOnce((time) => {
      this.updateUIForPlay(clipId, time);
    }, at);
  }

  public stop(at: Time, immediate: boolean = false) {
    this.clearPlayEvent();

    if (immediate) {
      this.stopTrackAudio("+0.01");
      this.updateUIForStop("+0.01");
      return;
    }
    // const fireTime =
    //   typeof at === "number" && Transport.seconds > at ? "+0.05" : at;
    // console.log(`stop time ${fireTime} :: TT: ${Transport.seconds}`);
    Transport.scheduleOnce((time) => {
      this.stopTrackAudio(time);
      this.updateUIForStop(time);
    }, at);
  }

  private clearPlayEvent(): void {
    this._playEvent !== null && Transport.clear(this._playEvent);
  }

  private stopTrackAudio(time: Time): void {
    const currentlyPlaying = this.currentlyPlayingClip();
    !!currentlyPlaying && currentlyPlaying.stopAudio(time);
  }

  private updateUIForPlay(clipId: ClipID, at: Time): void {
    // const time = typeof at === "number" && Tone.now() > at ? "+0.05" : at;
    // console.log(`play UI at ${time}`);
    Draw.schedule(() => {
      vampsetStore.update((store) => {
        if (this.currentlyPlaying && this.currentlyPlaying !== clipId) {
          store[this.id].clips[this.currentlyPlaying].stopVisual();
        }
        store[this.id].clips[clipId].playVisual();
        this.currentlyPlaying = clipId;
        return store;
      });
    }, at);
  }

  private updateUIForStop(at: Time): void {
    // const time = typeof at === "number" && Tone.now() > at ? "+0.01" : at;
    // console.log(`stop UI at ${time}`);
    Draw.schedule(() => {
      vampsetStore.update((store) => {
        !!this.currentlyPlaying &&
          store[this.id].clips[this.currentlyPlaying].stopVisual();
        this.currentlyPlaying = null;
        this._playEvent = null;
        return store;
      });
    }, at);
  }

  private currentlyPlayingClip() {
    return this.currentlyPlaying && this.clips[this.currentlyPlaying];
  }

  private loopClip(clipId: ClipID, at: Time, endTime: Time, every: Time): void {
    this._playEvent = Transport.scheduleRepeat(
      (audioContextTime: number) => {
        this.clips[clipId].playAudio(audioContextTime, endTime);
      },
      every,
      at,
    );
  }
}
