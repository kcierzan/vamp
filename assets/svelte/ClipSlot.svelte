<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import clipStore from "js/stores/clips";
  import ClipComponent from "./Clip.svelte";
  import { DndItem, TrackData } from "js/types";
  import { isClip, newClipFromPool, updateClipProperties } from "js/clip";
  import { isAudioFile } from "js/audio-file";

  export let index: number;
  export let track: TrackData;
  let items: DndItem[];
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";
  $: occupyingClip = Object.values($clipStore).find(
    (clip) => clip.index === index && track.id === clip.track_id,
  );
  $: items = !!occupyingClip ? [occupyingClip] : [];

  function consider(e: CustomEvent<DndEvent<DndItem>>) {
    considering = !!e.detail.items.length;
    items = e.detail.items;
  }

  function finalize(e: CustomEvent<DndEvent<DndItem>>) {
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    const clip = e.detail.items.find((item) => isClip(item));

    considering = false;
    items = e.detail.items;
    if (isAudioFile(audioFile)) {
      // create a new clip from the pool
      newClipFromPool(audioFile, track.id, index);
    } else if (isClip(clip)) {
      // move the clip optimistically
      clipStore.deleteClip(clip);
      updateClipProperties({ ...clip, index, track_id: track.id });
    }
  }

  $: options = {
    dropFromOthersDisabled: !!occupyingClip,
    items: items,
    flipDurationMs: 100,
  };
</script>

<div
  class="box-content h-8 w-36 rounded border-2 {dndBg}"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as clip (clip.id)}
    {#if "audio_file" in clip}
      <ClipComponent {clip} />
    {:else}
      <div class="placeholder h-8 w-36" />
    {/if}
  {/each}
</div>
