<!-- <svelte:options immutable /> -->

<script lang="ts">
  import {
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    TRIGGERS,
    dndzone,
  } from "svelte-dnd-action";
  import { pushCreateTrackFromAudioFile } from "js/track";
  import { AudioFile, DndItem } from "js/types";
  import { isAudioFile } from "js/audio-file";

  export let songId: string;

  const dummyItem = { id: "dummy" };
  let items: DndItem[] = [dummyItem];
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";

  function considerNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    setConsidering(e.detail.info.trigger);
    items = ensureDraggedItemFirst(e.detail.items);
  }

  function finalizeNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    // FIXME: this needs to support clips also
    considering = false;
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    !!audioFile && pushCreateTrackFromAudioFile(songId, audioFile as AudioFile);
    items = [dummyItem];
  }

  function setConsidering(trigger: TRIGGERS) {
    if (trigger === TRIGGERS.DRAGGED_ENTERED) considering = true;
    if (trigger === TRIGGERS.DRAGGED_LEFT) considering = false;
  }

  function ensureDraggedItemFirst(items: DndItem[]) {
    return items
      .filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
      .concat(
        items.filter((item: any) => item[SHADOW_ITEM_MARKER_PROPERTY_NAME]),
      );
  }
</script>

<div
  use:dndzone={{
    items: items,
    flipDurationMs: 100,
    morphDisabled: true,
    dragDisabled: true,
  }}
  on:consider={considerNewTrack}
  on:finalize={finalizeNewTrack}
  class="flex w-full items-center justify-center {dndBg}"
>
  {#each items as item, i (item.id)}
    {#if i == 0}
      <div class="flex w-40 flex-col items-center gap-4">
        <svg class="hero-plus-circle h-20 w-20 bg-slate-300" />
        <p class="text-center">Drag some files here to add a new track</p>
      </div>
    {:else}
      <span />
    {/if}
  {/each}
</div>
