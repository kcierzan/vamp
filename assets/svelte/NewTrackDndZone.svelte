<svelte:options immutable />

<script lang="ts">
  import {
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    TRIGGERS,
    dndzone,
  } from "svelte-dnd-action";
  import { tracks } from "js/messages";
  import { AudioFile, Clip, DndItem } from "js/types";
  import { isAudioFile, isClip } from "js/utils";

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
    considering = false;
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    const clip = e.detail.items.find((item) => isClip(item));
    items = [dummyItem];
    if (isAudioFile(audioFile)) {
      tracks.createFromAudioFile(songId, audioFile as AudioFile);
    } else if (isClip(clip)) {
      tracks.createFromClip(songId, clip as Clip);
    }
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
