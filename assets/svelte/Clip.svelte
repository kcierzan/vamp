<script>
  import Button from "./Button.svelte";
  import { sessionStore } from "js/store";

  export let id;
  export let name;
  export let trackId;
  export let paused = true;
  export let playbackRate = 100;

  const { addClip, playClip, stopClip, changePlaybackRate } = sessionStore;

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
  {#if paused}
    <Button
      classes={"rounded-l-lg"}
      onClick={() => {
        playClip(id, trackId);
      }}>{name}</Button
    >
  {:else}
    <Button
      classes={"rounded-l-lg"}
      onClick={() => {
        stopClip(id, trackId);
      }}
      negative={true}>{name}</Button
    >
  {/if}
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
