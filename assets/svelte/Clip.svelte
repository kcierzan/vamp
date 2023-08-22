<script>
  import Button from "./Button.svelte";
  import tracks from "js/stores/tracks";

  export let id;
  export let name;
  export let trackId;
  export let paused = true;
  export let playbackRate = 100;

  const { addClip, playClip, stopClip, changePlaybackRate } = tracks;

  function changeClip() {
    addClip(this.files[0], trackId, id);
  }

  function changeTempo() {
    changePlaybackRate(id, trackId, this.value);
  }
</script>

<div class="flex flex-row mb-2">
  <input
    id="clipchange-{id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  <Button
    onClick={() => {
      paused ? playClip(id, trackId) : stopClip(id, trackId);
    }}
    negative={!paused}
  >
    {name}
  </Button>
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label for="clipchange-{id}" class="inline-block py-5 min-h-full min-w-full"
      >change file</label
    >
  </div>
</div>
<input
  class="mb-2 w-64"
  type="range"
  min="0"
  max="200"
  bind:value={playbackRate}
  on:input={changeTempo}
/>
