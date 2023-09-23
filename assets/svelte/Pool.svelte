<script lang="ts">
  import pool from "js/stores/pool";
  import { dndzone } from "svelte-dnd-action";
  import PoolItem from "./PoolItem.svelte";
  import { AudioFile } from "js/types";

  $: items = $pool;

  function handleDndConsider(e: CustomEvent<DndEvent<AudioFile>>) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<AudioFile>>) {
    if (e.detail.items.length < $pool.length) {
      items = $pool;
    } else {
      items = e.detail.items;
    }
  }
</script>

<div
  class="min-w-max flex border-2 border-slate-200 rounded p-2 flex-col gap-1"
  use:dndzone={{
    items: items,
    dropFromOthersDisabled: true,
    morphDisabled: true,
    flipDurationMs: 100,
  }}
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
