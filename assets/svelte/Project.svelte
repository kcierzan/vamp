<script>
  import { onMount } from "svelte";
  import { Socket } from "phoenix";

  import Track from "./Track.svelte";

  let channel;
  let tracks = [];

  function addTrack() {
    tracks = [...tracks, Track];
  }

  function removeTrack(index) {
    return () => {
      tracks = [...tracks.slice(0, index), ...tracks.slice(index + 1)];
    };
  }

  onMount(async () => {
    const socket = new Socket("/socket", {
      params: { token: window.userToken },
    });
    socket.connect();
    channel = socket.channel("room:session", {});
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-6xl underline bold">Welcome to Vamp</h1>
  {#if !tracks.length}
    <h2 class="text-2xl">Why don't you start by adding some tracks?</h2>
  {:else}
    <div class="text-2xl">&nbsp</div>
  {/if}
</div>

<button
  class="rounded class bg-green-500 hover:bg-green-700 text-white w-24 h-16 mb-4"
  on:click={addTrack}>Add track</button
>
<div class="flex flex-row w-full space-x-4">
  {#each tracks as track, index}
    <div class="flex flex-col items-center">
      <div class="mb-2">
        <svelte:component this={track} {channel} />
      </div>
      <button
        class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16"
        on:click={removeTrack(index)}>Remove track</button
      >
    </div>
  {/each}
</div>
