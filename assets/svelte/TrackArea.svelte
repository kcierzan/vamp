<script lang="ts">
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME, dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";
  import { newTrackFromPoolItem } from "js/stores/tracks/new";
  import { Transport } from "tone";

  export let songId: string;
  let considering = false;
  $: tracks = Object.values($project);
  let items: any[] = [{ id: 1 }];
  let draggingItem: any;

  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";

  function considerNewTrack(e: any) {
    if (e.detail.items.length) {
      considering = true;
    } else {
      considering = false;
    }
    items = e.detail.items
      .filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
      .concat(
        e.detail.items.filter(
          (item: any) => item[SHADOW_ITEM_MARKER_PROPERTY_NAME]
        )
      );
    draggingItem = e.detail.items[0];
  }

  // NOTE: supports dragging from the pool ONLY
  function finalizeNewTrack(e: any) {
    console.log("finalize items", e.detail.items);
    const item = draggingItem;
    considering = false;
    items = [{ id: 1 }];
    newTrackFromPoolItem({
      song_id: songId,
      name: "new track",
      gain: 0.0,
      panning: 0.0,
      audio_clips: [
        {
          name: item.name,
          type: item.media_type,
          playback_rate: item.bpm ? Transport.bpm.value / item.bpm : 1.0,
          index: 0,
          audio_file_id: item.id,
        },
      ],
    });
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
    class="flex justify-center items-center border-2 border-orange-500 w-full {dndBg}"
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
