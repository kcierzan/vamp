import { getContext } from "tone";
import transportStore from "js/stores/transport";
import poolStore from "js/stores/pool";
import trackDataStore from "js/stores/track-data";
import samplerStore from "js/stores/samplers";
import trackPlaybackStore from "js/stores/tracks";
import clipStore from "js/stores/clips";
import latencyMessage from "js/messages/latency";
import { joinChannels } from "js/channels";
import clipMessage from "js/messages/clip";
import { Song, Token, User } from "js/types";
import { get } from "svelte/store"

function initializeStores(props: Song) {
  trackDataStore.initialize(props.tracks);
  transportStore.initialize(props.bpm);
  samplerStore.initialize(props.tracks);
  trackPlaybackStore.initialize(props.tracks);
  clipStore.initialize(props.tracks);
  poolStore.initialize(props.audio_files);
}

async function configureAudioContext() {
  const context = getContext();
  context.lookAhead = 0.1;
  await context.addAudioWorkletModule("/assets/phase-vocoder.js");
}

export async function initialize(
  props: Song,
  user: User,
  token: Token,
) {
  await configureAudioContext();
  initializeStores(props);
  joinChannels(token, user);
  clipMessage.stretchClipsToBpm(get(trackDataStore), props.bpm);
  latencyMessage.calculateLatency();
}
