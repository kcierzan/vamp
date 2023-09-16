<script lang="ts">
  import type { HTMLInputEvent } from "js/types";
  import ClipComponent from "./Clip.svelte";
  import type Track from "js/track";
  import project from "js/stores/project";
  import { newClip } from "js/stores/clips/new";
  import { removeTrack } from "../js/stores/tracks/remove";
  import { stopTracks } from "js/stores/tracks/stop";

  export let track: Track;
  let input: HTMLInputElement;

  $: onlyTrack = Object.keys($project).length === 1;

  function uploadClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    newClip(e.currentTarget.files[0], track.id);
    input.value = "";
  }
</script>

<div class="flex flex-col items-center border-2 border-blue-500 border-solid">
  <div class="mb-2">
    <div class="flex flex-col items-center justify-center">
      {#each Object.values(track.clips) as clip (clip?.id)}
        <ClipComponent {clip} />
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
    {#if !onlyTrack}
      <button
        class="rounded class bg-red-500 hover:bg-red-700 text-white w-24 h-16 mr-4"
        on:click={() => removeTrack(track.id)}>Remove track</button
      >
    {/if}
    <button
      class="bg-red-500 hover:bg-red-700 rounded text-white w-24 h-16"
      on:click={() => stopTracks([track.id])}>Stop</button
    >
  </div>
</div>
