import type { Channel } from "phoenix";
import type { Transport } from "tone";
import Clip from "js/clip";
import Track from "js/track";

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

export interface ClipData {
  id: ClipID;
  trackId: TrackID;
  name: string;
  type: string;
  state: PlayState;
  currentTime: number;
  playbackRate: number;
  bpm: number;
}

export interface NewClip extends ClipData {
  data: string;
}

export interface TrackClips {
  [key: string]: Clip;
}

export enum ChannelName {
  Private = "private",
  Shared = "shared",
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
  bpm: number;
}

export interface SceneStore {
  states: PlayState[];
  scenes: Scene[];
}

export type HTMLInputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};
