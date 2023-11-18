import { getContext } from "tone";
import instruments from "js/instruments";
import {
  clipStore,
  trackPlaybackStore,
  trackDataStore,
  poolStore,
  transportStore,
} from "js/stores";
import {
  dataChannel,
  userChannel,
  fileChannel,
  playbackChannel,
  latencyChannel,
} from "js/channels";
import { clips, latency } from "js/messages";
import { Song, Token, User } from "js/types";
import { get } from "svelte/store";

const songChannels = [
  dataChannel,
  fileChannel,
  playbackChannel,
  latencyChannel,
];

const trackInitializedStores = [
  trackDataStore,
  trackPlaybackStore,
  clipStore,
  instruments,
];

function initializeStores(song: Song) {
  trackInitializedStores.forEach((store) => store.initialize(song.tracks));
  transportStore.initialize(song.bpm);
  poolStore.initialize(song.audio_files);
}

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.05;
  await context.addAudioWorkletModule("/assets/phase-vocoder.js");
}

export async function initialize(song: Song, user: User, token: Token) {
  await configureAudioContext();
  initializeStores(song);
  songChannels.forEach((channel) => channel.join(song.id, token));
  userChannel.join(user, song.id, token);
  clips.stretchClipsToBpm(get(trackDataStore), song.bpm);
  latency.calculateLatency();
}
