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
  [key: TrackID]: Track;
}

export interface ChannelStore {
  shared: Channel | null;
  private: Channel | null;
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

export interface TrackClips {
  [key: ClipID]: Clip;
}

export enum ChannelName {
  Private = "private",
  Shared = "shared",
}

export enum PrivateMessages {
  PlayClip = "play_clip",
  StopClip = "stop_clip",
}

export enum SharedMessages {
  NewClip = "new_clip",
  UpdateClipProperties = "update_clip_properties",
  NewTrack = "new_track",
  RemoveTrack = "remove_track",
}

export interface Scene {
  [key: TrackID]: Clip | null;
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

export type HTMLInputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};
