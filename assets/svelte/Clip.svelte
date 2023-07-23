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

<div class="flex flex-row items-center justify-center">
  <audio {src} bind:paused />
  <input type="file" on:change={handleFileChange} />
  <div>
    {audioFile.name}
  </div>
  <div>
    {#if paused}
      <Button onClick={playAudio}>Play</Button>
    {:else}
      <Button onClick={stopAudio} negative={true}>Stop</Button>
    {/if}
  </div>
</div>
