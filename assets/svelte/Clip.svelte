<script>
  import Button from "./Button.svelte";
  import { fileToB64, b64ToAudioSrc } from "js/utils";

  export let clip;
  export let channel;
  let paused = true;

  $: src = b64ToAudioSrc(clip.data, clip.type);

  function playAudio() {
    paused = false;
  }

  function stopAudio() {
    paused = true;
  }

  async function handleFileChange() {
    const file = this.files[0];
    const data = await fileToB64(file);
    channel.push("new_clip", {
      id: clip.id,
      name: file.name,
      type: file.type,
      data: data,
    });
  }
</script>

<div class="flex flex-row mb-2">
  <audio {src} bind:paused />
  <input
    id="clipchange-{clip.id}"
    type="file"
    class="hidden"
    on:change={handleFileChange}
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
