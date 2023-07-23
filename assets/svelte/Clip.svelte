<script>
  import Button from "./Button.svelte";
  import { fileToB64, b64ToAudioSrc } from "js/utils";

  export let audioFile;
  export let channel;
  let paused = true;

  $: src = b64ToAudioSrc(audioFile.data, audioFile.type);

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
      id: audioFile.id,
      name: file.name,
      type: file.type,
      data: data,
    });
  }
</script>

<div class="flex flex-row mb-2">
  <audio {src} bind:paused />
  <input
    id="clipchange-{audioFile.id}"
    type="file"
    on:change={handleFileChange}
    class="hidden"
  />
  {#if paused}
    <Button onClick={playAudio}>{audioFile.name}</Button>
  {:else}
    <Button onClick={stopAudio} negative={true}>{audioFile.name}</Button>
  {/if}
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label
      for="clipchange-{audioFile.id}"
      class="inline-block py-5 min-h-full min-w-full">change file</label
    >
  </div>
</div>
