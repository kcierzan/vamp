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

function setInitialStateFromProps(props: Song) {
  transportStore.setBpm(props.bpm);
  trackDataStore.setFromProps(props.tracks);
  trackPlaybackStore.setFromProps(props.tracks);
  samplerStore.setFromProps(props.tracks);
  poolStore.set(props.audio_files);
  clipStore.setFromProps(props.tracks);
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
  setInitialStateFromProps(props);
  joinChannels(token, user);
  clipMessage.push.stretchClipsToBpm(get(trackDataStore), props.bpm);
  latencyMessage.calculateLatency();
}
