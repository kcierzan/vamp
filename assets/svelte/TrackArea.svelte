<script lang="ts">
  import {
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    TRIGGERS,
    dndzone,
  } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";
  import { newTrackFromPoolItem } from "js/stores/tracks/new";
  import { AudioFile, Clip } from "js/types";

  interface PlaceHolderDndItem {
    id: number;
  }

  type DndItem = PlaceHolderDndItem | AudioFile | Clip;

  export let songId: string;
  $: tracks = Object.values($project);
  let items: DndItem[] = [{ id: 1 }];
  let draggingItem: DndItem;

  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";

  function considerNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    if (e.detail.info.trigger === TRIGGERS.DRAGGED_ENTERED) considering = true;
    if (e.detail.info.trigger === TRIGGERS.DRAGGED_LEFT) considering = false;
    items = e.detail.items
      .filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
      .concat(
        e.detail.items.filter(
          (item: any) => item[SHADOW_ITEM_MARKER_PROPERTY_NAME]
        )
      );
    draggingItem = e.detail.items[0];
  }

  function finalizeNewTrack(e: CustomEvent<DndEvent<DndItem>>) {
    console.log("finalize items", e.detail.items);
    // FIXME: this needs to support clips also
    const audioFile = draggingItem;
    considering = false;
    items = [{ id: 1 }];
    newTrackFromPoolItem(songId, audioFile);
  }
</script>

<div class="flex flex-row-reverse w-2/3 h-4/6 overflow-scroll">
  <div
    use:dndzone={{
      items: items,
      flipDurationMs: 0,
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
