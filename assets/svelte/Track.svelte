<svelte:options immutable />

<script lang="ts">
  import { afterUpdate } from "svelte";
  import { flash } from "js/utils";
  import type { TrackData } from "js/types";
  import ClipSlot from "./ClipSlot.svelte";

  export let track: TrackData;
  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS,
  }));

  let element: HTMLElement;
  afterUpdate(() => flash(element));

  // function uploadClip(e: HTMLInputEvent) {
  //   if (!e.currentTarget.files) return;
  //   pushCreateClipFromFile(e.currentTarget.files[0], track.id);
  // }

</script>

<div class="flex flex-col gap-1 w-30" bind:this={element}>
  <div>{track.name}</div>
  {#each slots as slot, i (slot.id)}
    <ClipSlot index={i} {track} />
  {/each}
</div>
