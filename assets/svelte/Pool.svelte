<script lang="ts">
  import pool from "js/stores/pool";
  import { dndzone } from "svelte-dnd-action";
  import PoolItem from "./PoolItem.svelte";

  $: items = $pool;

  function handleDndConsider(e: any) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: any) {
    if (e.detail.items.length < $pool.length) {
      items = $pool;
    } else {
      items = e.detail.items;
    }
  }
</script>

<div
  class="min-w-max flex flex-col gap-1"
  use:dndzone={{ items: items, dropFromOthersDisabled: true }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#if !!items.length}
    {#each items as audioFile (audioFile.id)}
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
