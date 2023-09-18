<script lang="ts">
  import type { Token, User } from "js/types";
  import * as Tone from "tone";
  import { onMount } from "svelte";
  import projectStore from "../js/stores/project";
  import latency from "../js/stores/latency";
  import { joinChannels } from "js/channels";
  import { newTrack } from "../js/stores/tracks/new";
  import { setInitialStateFromProps } from "js/stores/project/new";
  import Scenes from "./Scenes.svelte";
  import Tempo from "./Tempo.svelte";
  import Metronome from "./Metronome.svelte";
  import Transport from "./Transport.svelte";
  import Quantization from "./Quantization.svelte";
  import Pool from "./Pool.svelte";
  import TrackArea from "./TrackArea.svelte";

  export let currentUser: User;
  export let token: Token;
  export let project: any;

  const { calculateLatency } = latency;

  $: sessionEmpty = Object.keys($projectStore).length === 0;

  onMount(async () => {
    Tone.getContext().lookAhead = 0;

    joinChannels(token, currentUser);
    setInitialStateFromProps(project);
    calculateLatency();
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-4xl underline bold">{project.title}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latency} ms!</h3>
</div>

<div class="flex flex-row space-x-4">
  <button class="add-track" on:click={() => newTrack(project.id)}>
    <span class="hero-plus-circle self-center h-8 w-8" />
    <span class="self-center">Add track</span>
  </button>
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>

<div class="flex flex-row w-full justify-center gap-1">
  <Scenes />
  <TrackArea songId={project.id} />
  <Pool />
</div>

<style lang="postcss">
  .add-track {
    @apply flex justify-center space-x-4 rounded bg-green-500 text-white text-lg w-24 h-16 mb-4 flex-grow hover:bg-green-700;
  }
</style>
