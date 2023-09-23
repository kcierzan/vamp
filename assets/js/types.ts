import type { Channel } from "phoenix";
import type { Transport, GrainPlayer } from "tone";

export interface Song {
  id: string;
  title: string;
  description: string;
  time_signature: string;
  bpm: number;
  tracks: TrackData[];
  audio_files: AudioFile[];
}

export interface Track extends TrackData {
  currentlyPlaying: ClipID | null;
  clips: TrackClips;
  playEvent: number | null;
}

export interface TrackData {
  readonly id: TrackID;
  gain: number;
  panning: number;
  name: string;
  audio_clips: Clip[];
}

export interface Clip {
  readonly id: ClipID;
  readonly track_id: TrackID;
  name: string;
  playback_rate: number;
  grainPlayer?: GrainPlayer;
  index: number;
  state: PlayState;
  type: string;
  audio_file: AudioFile | null;
}

export interface StaticFile {
  file_name: string;
  url: string;
}

export interface AudioFile {
  readonly id: string;
  bpm: number;
  name: string;
  description: string;
  file: StaticFile;
  readonly size: number;
  readonly media_type: string;
}

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

export interface TrackClips {
  [key: ClipID]: Clip;
}

export enum ChannelName {
  Private = "private",
  Shared = "shared",
}

export enum PrivateMessages {
  PlayClip = "play_clip",
  StopTrack = "stop_track",
  StartTransport = "start_transport",
  StopTransport = "stop_transport",
}

export enum SharedMessages {
  NewClip = "new_clip",
  UpdateClips = "update_clips",
  NewTrack = "new_track",
  RemoveTrack = "remove_track",
}

export enum QuantizationInterval {
  None = "+0.01",
  EightBars = "@8m",
  FourBars = "@4m",
  TwoBars = "@2m",
  OneBar = "@1m",
  HalfNote = "@2n",
  QuarterNote = "@4n",
  EigthNote = "@8n",
  SixteenthNote = "@16n",
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

interface PlaceHolderDndItem {
  id: string;
}

export type DndItem = PlaceHolderDndItem | AudioFile | Clip;
