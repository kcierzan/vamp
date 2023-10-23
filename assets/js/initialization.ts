import { getContext } from "tone";
import {
  clipStore,
  trackPlaybackStore,
  samplerStore,
  trackDataStore,
  poolStore,
  transportStore,
} from "js/stores/index";
import {
  dataChannel,
  userChannel,
  fileChannel,
  playbackChannel,
  latencyChannel,
} from "js/channels/index";
import { clipMessage, latencyMessage } from "js/messages/index";
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
  samplerStore,
  trackPlaybackStore,
  clipStore,
];

function initializeStores(song: Song) {
  trackInitializedStores.forEach((store) => store.initialize(song.tracks));
  transportStore.initialize(song.bpm);
  poolStore.initialize(song.audio_files);
}

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.1;
  await context.addAudioWorkletModule("/assets/phase-vocoder.js");
}

export async function initialize(song: Song, user: User, token: Token) {
  await configureAudioContext();
  initializeStores(song);
  songChannels.forEach((channel) => channel.join(song.id, token));
  userChannel.join(user, song.id, token);
  clipMessage.stretchClipsToBpm(get(trackDataStore), song.bpm);
  latencyMessage.calculateLatency();
}
