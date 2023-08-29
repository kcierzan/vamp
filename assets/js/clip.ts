import type { GrainPlayer } from "tone";
import { TrackID, PlayState, ClipID, PlayableClip } from "./types";

export default class Clip implements PlayableClip {
  public trackId: TrackID;
  public name: string;
  public playbackRate: number;
  public currentTime: number;
  public id: ClipID;
  public state: PlayState;
  public type: string;
  public bpm: number;
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
    this.playbackRate = playbackRate;
    this.currentTime = currentTime;
    this.id = id;
    this.state = state;
    this.type = type;
    this.bpm = bpm;
    this._grainPlayer = null;
  }

  get grainPlayer() {
    return this._grainPlayer;
  }

  set grainPlayer(grainPlayer: GrainPlayer | null) {
    this._grainPlayer = grainPlayer;
    if (this._grainPlayer) {
      this._grainPlayer.grainSize = 0.2;
      this._grainPlayer.overlap = 0.05;
      this._grainPlayer.playbackRate = this.playbackRate;
    }
  }

  playAudio(startTime: number, stopTime: number | string) {
    this._grainPlayer?.start(startTime).stop(stopTime);
  }

  stopAudio(time: number) {
    this._grainPlayer?.stop(time);
  }

  queueVisual() {
    this.state = PlayState.Queued;
  }

  playVisual() {
    this.state = PlayState.Playing;
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this._grainPlayer) {
      this._grainPlayer.playbackRate = rate;
    }
  }

  stopVisual() {
    this.state = PlayState.Stopped;
  }

  get playable() {
    return !!this.grainPlayer;
  }

  serialize() {
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
