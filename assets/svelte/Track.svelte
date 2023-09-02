<script lang="ts">
  import type { HTMLInputEvent } from "js/types";
  import Clip from "./Clip.svelte";
  import type Track from "js/track";
  import { newClip } from "js/stores/clips/new";
  import { removeTrack } from "../js/stores/tracks/remove";

  export let track: Track;
  let input: HTMLInputElement;

  function uploadClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    newClip(e.currentTarget.files[0], track.id);
    input.value = "";
  }
</script>

<div class="flex flex-col items-center">
  <div class="mb-2">
    <div class="flex flex-col items-center justify-center">
      {#each Object.values(track.clips) as clip (clip?.id)}
        <Clip {clip} />
      {/each}
      <input
        id="addclip-{track.id}"
        type="file"
        bind:this={input}
        on:change={uploadClip}
        class="hidden"
      />
      <div
        class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
      >
        <label
          for="addclip-{track.id}"
          class="inline-block py-5 min-h-full min-w-full">Add clip</label
        >
      </div>
    </div>
  </div>
  <div class="flex flex-row items-center">
    <button
      class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16 mr-4"
      on:click={() => removeTrack(track.id)}>Remove track</button
    >
    <button
      class="bg-red-500 hover:bg-red-700 rounded text-white w-24 h-16"
      on:click={() => alert("hey!")}>Stop</button
    >
  </div>
</div>
