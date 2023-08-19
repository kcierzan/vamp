<script>
  import { onMount } from "svelte";
  import { joinChannel } from "../js/utils";
  import { sessionStore } from "../js/store";
  import Track from "./Track.svelte";
  import Transport from "./Transport.svelte";

  export let currentUser;

  const socketPath = "/socket";
  const liveSetSharedChannel = "liveset:shared";
  const liveSetPrivateChannel = `private:${currentUser.id}`;
  const { setChannel, addTrack, removeTrack } = sessionStore;

  let currentLatency = 0;

  $: trackEntries = Object.entries($sessionStore.tracks);
  $: sessionEmpty = Object.keys($sessionStore.tracks).length === 0;

  function measureLatency(channel, count = 20) {
    if (count <= 0) {
      getLatency(channel);
      return;
    }
    channel
      .push("ping", { client_time: Date.now() })
      .receive("ok", ({ up, server_time }) => {
        const down = Date.now() - server_time;
        channel.push("report_latency", { latency: (up + down) / 2 });
      });
    setTimeout(() => measureLatency(channel, count - 1), 100);
  }

  function getLatency(channel) {
    channel.push("get_latency").receive("ok", (response) => {
      currentLatency = response;
    });
  }

  onMount(async () => {
    const sharedChannel = joinChannel(socketPath, liveSetSharedChannel);
    const privateChannel = joinChannel(socketPath, liveSetPrivateChannel);
    setChannel(sharedChannel, "shared");
    setChannel(privateChannel, "private");
    sharedChannel.push("clear_latency");
    measureLatency(sharedChannel);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="text-4xl underline bold">Welcome to Vamp, {currentUser.email}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {currentLatency} ms!</h3>
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
