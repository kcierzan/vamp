<script>
  import { onMount } from "svelte";
  import { Socket } from "phoenix";
  import Track from "./Track.svelte";
  import { createSessionStore } from "../js/store";

  let channel;
  const session = createSessionStore();
  const { setChannel, addTrack, removeTrack, addClip, playClip, stopClip } =
    session;
  $: trackEntries = Object.entries($session.tracks)
  $: sessionNotEmpty = !!Object.keys($session).length;

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
