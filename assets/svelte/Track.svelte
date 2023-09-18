<script lang="ts">
  import type { Track } from "js/types";
  import ClipSlot from "./ClipSlot.svelte";

  const NUMBER_OF_ROWS = 12;
  export let track: Track;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS,
  }));

  $: clips = Object.values(track.clips);

  // function uploadClip(e: HTMLInputEvent) {
  //   if (!e.currentTarget.files) return;
  //   newClip(e.currentTarget.files[0], track.id);
  // }
</script>

<div class="flex flex-col gap-1 w-30">
  {#each slots as slot, i (slot.id)}
    <ClipSlot items={!!clips[i] ? [clips[i]] : []} trackId={track.id} />
  {/each}
</div>
