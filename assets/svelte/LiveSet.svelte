<script lang="ts">
  import type { Token, User } from "js/types";
  import { onMount } from "svelte";
  import project from "../js/stores/project";
  import latency from "../js/stores/latency";
  import Track from "./Track.svelte";
  import Scenes from "./Scenes.svelte";
  import Tempo from "./Tempo.svelte";
  import Metronome from "./Metronome.svelte";
  import Transport from "./Transport.svelte";
  import Quantization from "./Quantization.svelte";
  import * as Tone from "tone";
  import {
    joinSharedChannel,
    joinPrivateChannel,
    joinFileChannel,
  } from "js/channels";
  import { newTrack } from "../js/stores/tracks/new";

  export let currentUser: User;
  export let token: Token;

  const { clearLatency, measureLatency } = latency;

  $: trackEntries = Object.entries($project);
  $: sessionEmpty = Object.keys($project).length === 0;

  onMount(async () => {
    Tone.getContext().lookAhead = 0;

    joinSharedChannel(token);
    joinFileChannel(token);
    joinPrivateChannel(token, currentUser);
    clearLatency();
    measureLatency();
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-4xl underline bold">Welcome to Vamp, {currentUser.email}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latency} ms!</h3>
</div>

<div class="flex flex-row space-x-4">
  <button
    class="flex justify-center space-x-4 rounded class bg-green-500 hover:bg-green-700 text-white text-lg w-24 h-16 mb-4 flex-grow"
    on:click={newTrack}
  >
    <span class="hero-plus-circle self-center h-8 w-8" />
    <span class="self-center">Add track</span>
  </button>
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>
<div class="flex flex-row w-full space-x-4">
  <Scenes />
  {#if trackEntries}
    {#each trackEntries as [id, track] (id)}
      <Track {track} />
    {/each}
  {/if}
</div>
