<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import Clip from "./Clip.svelte";
  import { TrackID } from "js/types";
  import { newClipFromPool } from "js/stores/clips/new";

  export let trackId: TrackID;
  export let items: any[] = [];

  function consider(e: any) {
    items = e.detail.items;
  }

  function finalize(e: any) {
    const draggedElem = e.detail.items.find(
      (item: any) => item.id === e.detail.info.id
    );
    newClipFromPool(draggedElem, trackId);
  }

  $: options = {
    dropFromOthersDisabled: !!items.length,
    items,
    flipDurationMs: 300,
  };
</script>

<div
  class="box-content border-2 rounded h-8 w-36"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as clip (clip.id)}
    <Clip {clip} />
  {/each}
</div>
