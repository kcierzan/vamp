<script>
  import { onMount } from "svelte";
  import { Socket } from "phoenix";
  import Track from "./Track.svelte";

  let channel;
  let tracks = {};

  function addTrack() {
    channel.push("new_track", {
      id: crypto.randomUUID(),
    });
  }

  function removeTrack(id) {
    return () => {
      channel.push("remove_track", { id });
    };
  }

  function onNewTrack({ id }) {
    tracks[id] = Track;
  }

  function onRemoveTrack({ id }) {
    const { [id]: _, ...otherTracks } = tracks;
    tracks = otherTracks;
  }

  function joinChannel() {
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
  }

  onMount(async () => {
    joinChannel();
    channel.on("new_track", onNewTrack);
    channel.on("remove_track", onRemoveTrack);
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
  {#each Object.entries(tracks) as [id, track] (id)}
    <div class="flex flex-col items-center">
      <div class="mb-2">
        <svelte:component this={track} {channel} currentTrackId={id} />
      </div>
      <button
        class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16"
        on:click={removeTrack(id)}>Remove track</button
      >
    </div>
  {/each}
</div>
