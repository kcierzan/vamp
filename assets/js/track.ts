import type { Time } from "tone/build/esm/core/type/Units";
import { Draw, Transport } from "tone";
import { ClipID, TrackClips, TrackID } from "./types";
import vampsetStore from "js/stores/vampset";
import * as Tone from "tone";

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
    Draw.schedule(() => {
      this.updateUIForQueue(clipId);
    }, Tone.now());

    Transport.scheduleOnce((time) => {
      this.stopTrackAudio(time);
      Draw.schedule(() => {
        this.clearPlayEvent();
        this.updateUIForPlay(clipId);
        this.loopClip(clipId, "+1m", "1m");
      }, time);
    }, at);
  }

  // This is the "transport" stop
  public stopAudio() {
    this.stopTrackAudio(undefined);
  }

  public stop(at: Time) {
    Transport.scheduleOnce((time) => {
      this.stopTrackAudio(time);
      Draw.schedule(() => {
        this.clearPlayEvent();
        this.updateUIForStop();
      }, time);
    }, at);
  }

  private clearPlayEvent(): void {
    if (this._playEvent !== null) {
      console.log(`cancelling event: ${this._playEvent}`);
      Transport.clear(this._playEvent);
    }
  }

  private stopTrackAudio(time: Time | undefined): void {
    const currentlyPlaying = this.currentlyPlayingClip();
    !!currentlyPlaying && currentlyPlaying.stopAudio(time);
  }

  private updateUIForPlay(clipId: ClipID): void {
    vampsetStore.update((store) => {
      if (this.currentlyPlaying && this.currentlyPlaying !== clipId) {
        store[this.id].clips[this.currentlyPlaying].stopVisual();
      }
      store[this.id].clips[clipId].playVisual();
      this.currentlyPlaying = clipId;
      return store;
    });
  }

  private updateUIForStop(): void {
    vampsetStore.update((store) => {
      !!this.currentlyPlaying &&
        store[this.id].clips[this.currentlyPlaying].stopVisual();
      this.currentlyPlaying = null;
      this._playEvent = null;
      return store;
    });
  }

  private updateUIForQueue(clipId: ClipID): void {
    vampsetStore.update((store) => {
      this.clips[clipId].queueVisual();
      return store;
    });
  }

  private currentlyPlayingClip() {
    return this.currentlyPlaying && this.clips[this.currentlyPlaying];
  }

  private loopClip(clipId: ClipID, endTime: Time, every: Time): void {
    this._playEvent = Transport.scheduleRepeat(
      (audioContextTime: number) => {
        this.clips[clipId].playAudio(audioContextTime, endTime);
      },
      every,
      "+0.01",
    );
    console.log(`creating event: ${this._playEvent}`);
  }
}
