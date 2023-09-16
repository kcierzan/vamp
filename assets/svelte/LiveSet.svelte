<script lang="ts">
  import type { Token, User } from "js/types";
  import type Clip from "js/clip";
  import { onMount } from "svelte";
  import { dndzone } from "svelte-dnd-action";
  import projectStore from "../js/stores/project";
  import latency from "../js/stores/latency";
  // import Track from "./Track.svelte";
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
  import { setInitialStateFromProps } from "js/stores/project/new";
  import ClipSlot from "./ClipSlot.svelte";
  import ClipComponent from "./Clip.svelte";

  export let currentUser: User;
  export let token: Token;
  export let project: any;

  const { clearLatency, measureLatency } = latency;

  const grid = Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => ({ id: i * 8 + j }))
  );

  $: clipz = Object.values($projectStore).flatMap((track) => {
    return Object.values(track.clips);
  });

  $: sessionEmpty = Object.keys($projectStore).length === 0;

  function handleDndConsider(e: any) {
    clipz = e.detail.items;
  }

  function handleDndFinalize(e: any) {
    console.log(e.detail.items);
    clipz = e.detail.items;
  }

  onMount(async () => {
    Tone.getContext().lookAhead = 0;

    joinSharedChannel(token);
    joinFileChannel(token);
    joinPrivateChannel(token, currentUser);
    setInitialStateFromProps(project);
    clearLatency();
    measureLatency();
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
  {#each grid as col}
    <div class="flex flex-col gap-1">
      {#each col as _slot}
        <ClipSlot />
      {/each}
    </div>
  {/each}
  <div
    class="min-w-max flex flex-col gap-1"
    use:dndzone={{ items: clipz }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#if !!clipz.length}
      {#each clipz as clip (clip.id)}
        <ClipComponent {clip} />
      {/each}
    {:else}
      <div class="h-8 w-20 min-w-20 min-h-8 empty" />
    {/if}
  </div>
</div>

<style lang="postcss">
  .add-track {
    @apply flex justify-center space-x-4 rounded bg-green-500 text-white text-lg w-24 h-16 mb-4 flex-grow hover:bg-green-700;
  }

  .empty::after {
    content: "\200B";
    visibility: hidden;
  }
</style>
