<script lang="ts">
  import type { Song, Token, User } from "js/types";
  import * as Tone from "tone";
  import { onMount } from "svelte";
  import clipStore from "js/stores/clips";
  import trackStore from "js/stores/tracks";
  import latency from "../js/stores/latency";
  import { joinChannels } from "js/channels";
  import { newTrack } from "../js/track";
  import transportStore from "js/stores/transport";
  import poolStore from "js/stores/pool";
  import Scenes from "./Scenes.svelte";
  import Tempo from "./Tempo.svelte";
  import Metronome from "./Metronome.svelte";
  import Transport from "./Transport.svelte";
  import Quantization from "./Quantization.svelte";
  import Pool from "./Pool.svelte";
  import TrackArea from "./TrackArea.svelte";

  export let currentUser: User;
  export let token: Token;
  export let project: Song;

  const { calculateLatency } = latency;

  $: sessionEmpty = Object.keys($clipStore).length === 0;

  function setInitialStateFromProps(props: Song) {
    transportStore.setBpm(props.bpm);
    trackStore.setTracksFromProps(props);
    poolStore.set(props.audio_files);
  }

  onMount(async () => {
    Tone.getContext().lookAhead = 0.05;

    joinChannels(token, currentUser);
    setInitialStateFromProps(project);
    calculateLatency();
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project.title}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latency} ms!</h3>
</div>

<div class="flex flex-row space-x-4">
  <button class="add-track" on:click={() => newTrack(project.id)}>
    <span class="hero-plus-circle h-8 w-8 self-center" />
    <span class="self-center">Add track</span>
  </button>
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>

<div class="flex w-full flex-row justify-center gap-1">
  <Scenes />
  <TrackArea songId={project.id} />
  <Pool />
</div>

<style lang="postcss">
  .add-track {
    @apply mb-4 flex h-16 w-24 flex-grow justify-center space-x-4 rounded bg-green-500 text-lg text-white hover:bg-green-700;
  }
</style>
