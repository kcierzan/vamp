<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";

  export let songId: string;
  $: tracks = Object.values($project);

  // const NUMBER_OF_ROWS = 12;
  // const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
  //   id: i * NUMBER_OF_ROWS,
  // }));

  function considerNewTrack(e: any) {
    // FIXME:
    tracks = e.detail.items;
  }

  // NOTE: supports dragging from the pool ONLY
  function finalizeNewTrack(e: any) {
    tracks = e.detail.items;
  }
</script>

<div class="flex flex-row-reverse w-2/3 h-4/6 overflow-scroll">
  <div
    use:dndzone={{ items: tracks, flipDurationMs: 300 }}
    on:consider={considerNewTrack}
    on:finalize={finalizeNewTrack}
    class="flex justify-center items-center border-2 border-orange-500 w-full"
  >
    <div class="flex flex-col items-center w-40 gap-4">
      <svg class="hero-plus-circle bg-slate-300 h-20 w-20" />
      <p class="text-center">Drag some files here to add a new track</p>
    </div>
  </div>
  <div class="flex flex-row">
    {#each tracks as track (track.id)}
      <Track {track} />
    {/each}
  </div>
</div>
