<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import ClipComponent from "./Clip.svelte";
  import { AudioFile, Clip, Track } from "js/types";
  import { newClipFromPool } from "js/stores/clips/new";

  export let index: number;
  export let track: Track;
  let items: Clip[] | AudioFile[];
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";
  $: occupyingClip = Object.values($project[track.id].clips).find(
    (clip) => clip.index === index
  );
  $: items = !!occupyingClip ? [occupyingClip] : [];

  function consider(e: CustomEvent<DndEvent<any>>) {
    considering = !!e.detail.items.length;
    items = e.detail.items;
  }

  function finalize(e: CustomEvent<DndEvent<any>>) {
    const dragged = e.detail.items.find(
      (item: Clip) => item.track_id !== track.id
    );
    considering = false;
    items = e.detail.items;
    newClipFromPool(dragged, track.id, index);
  }

  $: options = {
    dropFromOthersDisabled: !!occupyingClip,
    items: items,
    flipDurationMs: 0,
  };
</script>

<div
  class="box-content border-2 rounded h-8 w-36 {dndBg}"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as clip (clip.id)}
    {#if "audio_file" in clip}
      <ClipComponent {clip} />
    {:else}
      <div class="h-8 w-36 placeholder" />
    {/if}
  {/each}
</div>
