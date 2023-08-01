<script>
  import { onMount } from "svelte";
  import { joinChannel } from "../js/utils";
  import { sessionStore } from "../js/store";
  import Track from "./Track.svelte";

  const socketPath = "/socket";
  const channelRoom = "room:session";
  const { setChannel, addTrack, removeTrack, addClip, playClip, stopClip } =
    sessionStore;
  $: trackEntries = Object.entries($sessionStore.tracks);
  $: sessionNotEmpty = !!Object.keys($sessionStore).length;

  onMount(async () => {
    const channel = joinChannel(socketPath, channelRoom);
    setChannel(channel);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-6xl underline bold">Welcome to Vamp</h1>
  {#if sessionNotEmpty}
    <div class="text-2xl">&nbsp</div>
  {:else}
    <h2 class="text-2xl">Why don't you start by adding some tracks?</h2>
  {/if}
</div>

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={addTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
  {#each trackEntries as [id, track] (id)}
    <div class="flex flex-col items-center">
      <div class="mb-2">
        <Track {addClip} {playClip} {stopClip} {...track} />
      </div>
      <button
        class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16"
        on:click={() => removeTrack(id)}>Remove track</button
      >
    </div>
  {/each}
</div>
