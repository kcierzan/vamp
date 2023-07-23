<script>
  import Button from "./Button.svelte";
  import { afterUpdate } from "svelte";
  import { fileToBase64, base64ToFile } from "js/utils";

  export let audioFile;
  export let channel;
  let playing = false;

  $: audio = base64ToFile(audioFile.data, audioFile.type);

  function playAudio() {
    audio?.play();
  }

  function stopAudio() {
    audio?.pause();
  }

  function listenToStopped(audioElement) {
    ["pause", "ended"].forEach((event) => {
      audioElement.addEventListener(
        event,
        () => {
          playing = false;
        },
        false
      );
    });
  }

  function listenToStarted(audioElement) {
    audioElement.addEventListener(
      "play",
      () => {
        playing = true;
      },
      false
    );
  }

  async function handleFileChange() {
    const file = this.files[0];
    const data = await fileToBase64(file);
    channel.push("new_clip", {
      id: audioFile.id,
      name: file.name,
      type: file.type,
      data: data,
    });
  }

  afterUpdate(async () => {
    listenToStarted(audio);
    listenToStopped(audio);
  });
</script>

<div class="flex flex-row items-center justify-center">
  <input type="file" on:change={handleFileChange} />
  <div>
    {audioFile.name}
  </div>
  <div>
    {#if playing}
      <Button onClick={stopAudio} negative={true}>Stop</Button>
    {:else}
      <Button onClick={playAudio}>Play</Button>
    {/if}
  </div>
</div>
