<script>
  import { onMount } from "svelte";
  import { joinChannel } from "../js/utils";
  import { sessionStore } from "../js/store";
  import Track from "./Track.svelte";
  import Transport from "./Transport.svelte";

  const socketPath = "/socket";
  const channelRoom = "room:session";
  const { setChannel, addTrack, removeTrack } = sessionStore;

  $: trackEntries = Object.entries($sessionStore.tracks);
  $: sessionEmpty = Object.keys($sessionStore.tracks).length === 0;

  onMount(async () => {
    const channel = joinChannel(socketPath, channelRoom);
    setChannel(channel);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-6xl underline bold">Welcome to Vamp</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
</div>

<Transport />

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={addTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
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
</div>
