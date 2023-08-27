declare interface TrackStore {
  [key: string]: Track;
}

declare interface ClipInput {
  id: string;
  trackId: string;
  bpm: number;
  file: File;
}

declare interface ClipInfo {
  id: ClipID;
  trackId: TrackID;
  name: string;
  type: string;
  state: PlayState;
  currentTime: number;
  playbackRate: number;
  bpm: number;
}

declare interface Clip extends ClipInfo {
  grainPlayer: import("tone").GrainPlayer;
}

declare interface NewClip extends ClipInfo {
  data: string;
}

declare interface TrackClips {
  [key: string]: Clip;
}

declare interface Track {
  id: TrackID;
  playEvent: number | null;
  currentlyPlaying: ClipID | null;
  clips: TrackClips;
}

declare enum PlayState {
  Playing = "PLAYING",
  Stopped = "STOPPED",
  Queued = "QUEUED",
}

declare enum ChannelName {
  Private = "private",
  Shared = "shared",
}

declare interface Track {
  id: string;
}

type SceneClip = string | null;

declare interface Scene {
  TrackID: SceneClip;
}

declare type ClipID = string;

declare type TrackID = string;

declare type Token = string;

declare interface User {
  email: string;
  display_name: string;
  confirmed_at: string;
}
