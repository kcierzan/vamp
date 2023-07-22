<script>
  import Button from "./Button.svelte";

  let audio;
  let playing = false;

  function handleFileChange() {
    const file = this.files[0];
    audio = new Audio(URL.createObjectURL(file));
    listenToStopped(audio);
    listenToStarted(audio);
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

  function playAudio() {
    if (!audio) return;
    audio.play();
  }

  function stopAudio() {
    if (!audio) return;
    audio.pause();
  }
</script>

<input type="file" on:change={handleFileChange} />
<div>
  {#if playing}
    <Button onClick={stopAudio} negative={true}>Stop</Button>
  {:else}
    <Button onClick={playAudio}>Play</Button>
  {/if}
</div>

