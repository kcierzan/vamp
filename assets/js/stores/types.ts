import type { Channel } from "phoenix";

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

export interface Clip extends ClipInfo {
  grainPlayer: import("tone").GrainPlayer;
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

type SceneClip = string | null;

export interface Scene {
  TrackID: SceneClip;
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
  transport: typeof import("tone").Transport;
  state: PlayState;
}
