<script>
  import { onMount } from "svelte";
  import { fileToB64, b64ToAudioSrc } from "js/utils";
  import Button from "./Button.svelte";

  export let clip;
  export let channel;
  export let currentTrackId;
  let paused = true;
  let playbackRate = 100;
  let currentTime = 0.0;

  $: src = b64ToAudioSrc(clip.data, clip.type);
  $: scaledPlaybackRate = playbackRate / 100;

  function playAudio() {
    channel.push("play_clip", { clipId: clip.id, trackId: currentTrackId });
  }

  function stopAudio() {
    channel.push("stop_clip", { id: clip.id });
  }

  async function changeClip() {
    const file = this.files[0];
    const data = await fileToB64(file);
    channel.push("new_clip", {
      id: clip.id,
      name: file.name,
      type: file.type,
      data: data,
    });
  }

  onMount(async () => {
    channel.on("play_clip", ({ clipId, trackId }) => {
      if (clipId === clip.id) {
        paused = false;
      } else if (trackId === currentTrackId) {
        paused = true;
        currentTime = 0.0;
      }
    });

    channel.on("stop_clip", ({ id }) => {
      if (id === clip.id) {
        paused = true;
        currentTime = 0.0;
      }
    });
  });
</script>

<div class="flex flex-row mb-2">
  <audio
    {src}
    bind:paused
    bind:currentTime
    bind:playbackRate={scaledPlaybackRate}
  />
  <input
    id="clipchange-{clip.id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  {#if paused}
    <Button onClick={playAudio}>{clip.name}</Button>
  {:else}
    <Button onClick={stopAudio} negative={true}>{clip.name}</Button>
  {/if}
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label
      for="clipchange-{clip.id}"
      class="inline-block py-5 min-h-full min-w-full">change file</label
    >
  </div>
</div>
<input class="mb-2 w-64" type="range" min="0" max="200" bind:value={playbackRate} />
