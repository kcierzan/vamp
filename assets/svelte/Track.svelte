<script lang="ts">
  import type { Track } from "js/track";
  import ClipSlot from "./ClipSlot.svelte";

  export let track: Track;
  const slots = Array.from({ length: 8 }, (_, i) => ({ id: i * 8 }));

  $: clips = Object.values(track.clips);

  // function uploadClip(e: HTMLInputEvent) {
  //   if (!e.currentTarget.files) return;
  //   newClip(e.currentTarget.files[0], track.id);
  // }
</script>

<div
  class="flex flex-col gap-1 w-30 h-80 min-w-30 min-h-80"
>
  {#each slots as slot, i (slot.id)}
    <ClipSlot items={!!clips[i] ? [clips[i]] : []} trackId={track.id} />
  {/each}
</div>
