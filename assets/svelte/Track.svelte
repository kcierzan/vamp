<script lang="ts">
  import type { HTMLInputEvent, TrackClips } from "js/types";
  import Clip from "./Clip.svelte";
  import { newClip } from "js/stores/clips/new";

  export let id: string;
  export let clips: TrackClips = {};
  let clipBpm: number;

  function uploadClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    newClip(e.currentTarget.files[0], id, clipBpm);
    e.currentTarget.value = "";
  }
</script>

<div class="flex flex-col items-center justify-center">
  {#each Object.values(clips) as clip (clip?.id)}
    <Clip
      id={clip.id}
      trackId={id}
      name={clip.name}
      state={clip.state}
      playbackRate={clip.playbackRate}
      bpm={clip.bpm}
    />
  {/each}
  <input id="addclip-{id}" type="file" on:change={uploadClip} class="hidden" />
  <div
    class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
  >
    <label for="addclip-{id}" class="inline-block py-5 min-h-full min-w-full"
      >Add clip</label
    >
  </div>
  <input type="number" bind:value={clipBpm} />
</div>
