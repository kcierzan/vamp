<script>
  import { onMount } from "svelte";
  import { sessionStore } from "../js/store";
  import Track from "./Track.svelte";

  export let currentUser;

  let {
    measureLatency,
    addTrack,
    removeTrack,
    clearLatency,
    joinUserChannel,
    joinSharedChannel,
  } = sessionStore;

  let currentLatency = 0;
  $: trackEntries = Object.entries($sessionStore.tracks)
  $: sessionEmpty = Object.keys($sessionStore.tracks).length === 0

  onMount(async () => {
    joinSharedChannel();
    joinUserChannel(currentUser);
    clearLatency();
    measureLatency();
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-4xl underline bold">Welcome to Vamp, {currentUser.email}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {currentLatency} ms!</h3>
</div>

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={addTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
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
