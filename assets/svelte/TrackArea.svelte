<script lang="ts">
  import {
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    TRIGGERS,
    dndzone,
  } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";
  import { newTrackFromPoolItem } from "js/stores/tracks/new";
  import { AudioFile, DndItem } from "js/types";
  import { isAudioFile } from "js/audio-file";

  export let songId: string;
  $: tracks = Object.values($project);

  const dummyItem = { id: "dummy" };
  let items: DndItem[] = [dummyItem];
  let draggingItem: DndItem | AudioFile;
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";

  function considerNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    setConsidering(e.detail.info.trigger);
    items = ensureDraggedItemFirst(e.detail.items);
    setDraggedItem(e.detail.items);
  }

  function finalizeNewTrack(_e: CustomEvent<DndEvent<DndItem>>) {
    // FIXME: this needs to support clips also
    considering = false;
    isAudioFile(draggingItem) && newTrackFromPoolItem(songId, draggingItem);
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

  function setDraggedItem(items: DndItem[]) {
    const item = items.find((item) => isAudioFile(item));
    if (!!item) {
      draggingItem = item;
    } else {
      draggingItem = dummyItem;
    }
  }
</script>

<div class="flex flex-row-reverse w-2/3 h-4/6 overflow-scroll">
  <div
    use:dndzone={{
      items: items,
      flipDurationMs: 100,
      morphDisabled: true,
      dragDisabled: true,
    }}
    on:consider={considerNewTrack}
    on:finalize={finalizeNewTrack}
    class="flex justify-center items-center w-full {dndBg}"
  >
    {#each items as item, i (item.id)}
      {#if i == 0}
        <div class="flex flex-col items-center w-40 gap-4">
          <svg class="hero-plus-circle bg-slate-300 h-20 w-20" />
          <p class="text-center">Drag some files here to add a new track</p>
        </div>
      {:else}
        <span />
      {/if}
    {/each}
  </div>
  <div class="flex flex-row">
    {#each tracks as track (track.id)}
      <Track {track} />
    {/each}
  </div>
</div>
