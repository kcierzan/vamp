<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import Clip from "./Clip.svelte";

  export let items: any[] = [];

  function handleDnd(e: any) {
    items = e.detail.items;
  }

  $: options = {
    dropFromOthersDisabled: !!items.length,
    items,
    dropTargetStyle: {},
    flipDurationMs: 100,
  };
</script>

<div
  class="box-content border-2 rounded h-8 w-20 min-h-8 min-w-8"
  use:dndzone={options}
  on:consider={handleDnd}
  on:finalize={handleDnd}
>
  {#each items as clip (clip.id)}
    <Clip {clip} />
  {/each}
</div>
