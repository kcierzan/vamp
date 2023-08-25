<script>
  import { onMount } from "svelte";
  import tracks from "../js/stores/tracks";
  import latency from "../js/stores/latency";
  import Track from "./Track.svelte";
  import Scenes from "./Scenes.svelte";
  import Tempo from "./Tempo.svelte";

  export let currentUser;
  export let token;

  const { addTrack, removeTrack, joinPrivateChannel, joinSharedChannel } =
    tracks;

  const { clearLatency, measureLatency } = latency;

  $: trackEntries = Object.entries($tracks);
  $: sessionEmpty = Object.keys($tracks).length === 0;

  onMount(async () => {
    joinSharedChannel(token);
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

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={addTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
  <Scenes {sessionEmpty} />
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
