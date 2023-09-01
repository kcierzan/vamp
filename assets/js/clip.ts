import type { Time } from "tone/build/esm/core/type/Units";
import type { GrainPlayer } from "tone";
import { TrackID, PlayState, ClipID, ClipData } from "./types";

export default class Clip implements ClipData {
  public trackId: TrackID;
  public name: string;
  public currentTime: number;
  public id: ClipID;
  public state: PlayState;
  public type: string;
  public bpm: number;
  private _playbackRate: number;
  private _grainPlayer: GrainPlayer | null;

  constructor(
    trackId: TrackID,
    name: string,
    type: string,
    playbackRate: number,
    currentTime: number,
    bpm: number,
    id: ClipID = crypto.randomUUID(),
    state: PlayState = PlayState.Stopped,
  ) {
    this.trackId = trackId;
    this.name = name;
    this.currentTime = currentTime;
    this.id = id;
    this.state = state;
    this.type = type;
    this.bpm = bpm;
    this._grainPlayer = null;
    this._playbackRate = 1;
    this.playbackRate = playbackRate;
  }

  public get grainPlayer() {
    return this._grainPlayer;
  }

  public set grainPlayer(grainPlayer: GrainPlayer | null) {
    this._grainPlayer = grainPlayer;
    if (this._grainPlayer) {
      this._grainPlayer.grainSize = 0.2;
      this._grainPlayer.overlap = 0.05;
      this._grainPlayer.playbackRate = this.playbackRate;
    }
  }

  public set playbackRate(rate: number) {
    this._playbackRate = rate;
    if (this._grainPlayer) {
      this._grainPlayer.playbackRate = rate;
    }
  }

  public get playbackRate() {
    return this._playbackRate;
  }

  public playAudio(startTime: Time, stopTime: Time) {
    this._grainPlayer?.start(startTime).stop(stopTime);
  }

  public stopAudio(time: Time) {
    this._grainPlayer?.stop(time);
  }

  public queueVisual() {
    this.state = PlayState.Queued;
  }

  public playVisual() {
    this.state = PlayState.Playing;
  }

  public stopVisual() {
    this.state = PlayState.Stopped;
  }

  get playable() {
    return !!this.grainPlayer;
  }

  public setFromClipData({
    playbackRate,
    name,
    type,
    currentTime,
    bpm,
  }: {
    playbackRate?: number;
    name?: string;
    type?: string;
    currentTime?: number;
    bpm?: number;
  }) {
    if (playbackRate !== undefined) this.playbackRate = playbackRate;
    if (name !== undefined) this.name = name;
    if (currentTime !== undefined) this.currentTime = currentTime;
    if (type !== undefined) this.type = type;
    if (bpm !== undefined) this.bpm = bpm;
  }

  public serialize() {
    return {
      trackId: this.trackId,
      name: this.name,
      playbackRate: this.playbackRate,
      currentTime: this.currentTime,
      id: this.id,
      state: this.state,
      type: this.type,
      bpm: this.bpm,
    };
  }
}
