<script lang="ts">
  import type { Token, User } from "js/types";
  import { onMount } from "svelte";
  import vampset from "../js/stores/vampset";
  import latency from "../js/stores/latency";
  import Track from "./Track.svelte";
  import Scenes from "./Scenes.svelte";
  import Tempo from "./Tempo.svelte";
  import Metronome from "./Metronome.svelte";
  import {
    joinSharedChannel,
    joinPrivateChannel,
    joinFileChannel,
  } from "js/channels";
  import { newTrack } from "../js/stores/tracks/new";
  import { removeTrack } from "../js/stores/tracks/remove";

  export let currentUser: User;
  export let token: Token;

  const { clearLatency, measureLatency } = latency;

  $: trackEntries = Object.entries($vampset);
  $: sessionEmpty = Object.keys($vampset).length === 0;

  onMount(async () => {
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

<Tempo />
<Metronome />

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={newTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
  <Scenes />
  {#if trackEntries}
    {#each trackEntries as [id, track] (id)}
      <div class="flex flex-col items-center">
        <div class="mb-2">
          <Track {...track} />
        </div>
        <button
          class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16"
          on:click={() => removeTrack(id)}>Remove track</button
        >
      </div>
    {/each}
  {/if}
</div>
