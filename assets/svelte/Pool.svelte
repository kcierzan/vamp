<script lang="ts">
  import pool from "js/stores/pool";
  import { dndzone } from "svelte-dnd-action";
  import PoolItem from "./PoolItem.svelte";

  function handleDndConsider(e: any) {
    pool.set(e.detail.items);
  }

  function handleDndFinalize(e: any) {
    console.log(e.detail.items);
    //FIXME: implement copy-on-drag?
    pool.set(e.detail.items);
  }
</script>

<div
  class="min-w-max flex flex-col gap-1"
  use:dndzone={{ items: $pool, flipDurationMs: 300 }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#if !!$pool.length}
    {#each $pool as audioFile (audioFile.id)}
      <PoolItem {audioFile} />
    {/each}
  {:else}
    <div class="h-8 w-20 empty" />
  {/if}
</div>

<style lang="postcss">
  .empty::after {
    content: "\200B";
    visibility: hidden;
  }
</style>
