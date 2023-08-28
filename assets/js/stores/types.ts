import type { Channel } from "phoenix";
import type { Transport } from "tone";

export enum PlayState {
  Playing = "PLAYING",
  Stopped = "STOPPED",
  Queued = "QUEUED",
}

export interface TrackStore {
  [key: string]: Track;
}

export interface ChannelStore {
  shared: Channel | null;
  private: Channel | null;
}

export interface ClipInput {
  id: string;
  trackId: string;
  bpm: number;
  file: File;
}

export interface ClipInfo {
  id: ClipID;
  trackId: TrackID;
  name: string;
  type: string;
  state: PlayState;
  currentTime: number;
  playbackRate: number;
  bpm: number;
}

export interface NewClip extends ClipInfo {
  data: string;
}

export interface TrackClips {
  [key: string]: Clip;
}

export interface Track {
  id: TrackID;
  playEvent: number | null;
  currentlyPlaying: ClipID | null;
  clips: TrackClips;
}

export enum ChannelName {
  Private = "private",
  Shared = "shared",
}

export interface Track {
  id: string;
}

export interface Scene {
  [key: string]: Clip | null;
}

export type ClipID = string;

export type TrackID = string;

export type Token = string;

export interface User {
  id: number;
  email: string;
  display_name: string;
  confirmed_at: string;
}

export interface TransportStore {
  transport: typeof Transport;
  state: PlayState;
}

export interface SceneStore {
  states: PlayState[];
  scenes: Scene[];
}

export interface Clip extends ClipInfo {
  playAudio: (startTime: number, stopTime: number | string) => void;
  stopAudio: (time: number) => void;
  playVisual: () => void;
  stopVisual: () => void;
  queueVisual: () => void;
  setPlaybackRate: (rate: number) => void;
  serialize: () => ClipInfo;
}

export type HTMLInputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};
