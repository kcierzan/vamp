import type { GrainPlayer } from "tone";
import { TrackID, PlayState, ClipID, PlayableClip } from "./types";

export default class Clip implements PlayableClip {
  trackId: TrackID;
  name: string;
  playbackRate: number;
  currentTime: number;
  id: ClipID;
  state: PlayState;
  type: string;
  #grainPlayer: GrainPlayer;
  bpm: number;

  constructor(
    trackId: TrackID,
    name: string,
    type: string,
    playbackRate: number,
    currentTime: number,
    bpm: number,
    grainPlayer: GrainPlayer,
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
    this.#grainPlayer = grainPlayer;
    this.#grainPlayer.playbackRate = playbackRate;
    this.bpm = bpm;

    // TODO: parameterize these
    this.#grainPlayer.grainSize = 0.2;
    this.#grainPlayer.overlap = 0.05;
  }

  playAudio(startTime: number, stopTime: number | string) {
    this.#grainPlayer.start(startTime).stop(stopTime);
  }

  stopAudio(time: number) {
    this.#grainPlayer.stop(time);
  }

  queueVisual() {
    this.state = PlayState.Queued;
  }

  playVisual() {
    this.state = PlayState.Playing;
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    this.#grainPlayer.playbackRate = rate;
  }

  stopVisual() {
    this.state = PlayState.Stopped;
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
