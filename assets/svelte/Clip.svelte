<script>
  import Button from "./Button.svelte";
  import { b64ToAudioSrc } from "js/utils";
  import { sessionStore } from "js/store";

  export let id;
  export let data;
  export let type;
  export let name;
  export let trackId;
  export let paused = true;
  export let playbackRate = 100;
  export let currentTime = 0.0;

  const { addClip, playClip, stopClip, changePlaybackRate } = sessionStore;

  $: src = b64ToAudioSrc(data, type);
  $: scaledPlaybackRate = playbackRate / 100;

  function changeClip() {
    const file = this.files[0];
    addClip(file, trackId, id);
  }

  function changeTempo() {
    changePlaybackRate(id, trackId, this.value);
  }
</script>

<div class="flex flex-row mb-2">
  <audio
    {src}
    bind:paused
    bind:currentTime
    bind:playbackRate={scaledPlaybackRate}
  />
  <input
    id="clipchange-{id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  {#if paused}
    <Button
      onClick={() => {
        playClip(id, trackId);
      }}>{name}</Button
    >
  {:else}
    <Button
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
