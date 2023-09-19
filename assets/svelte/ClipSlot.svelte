<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Clip from "./Clip.svelte";
  import { AudioFile, PlayState, Track } from "js/types";
  import { newClipFromPool } from "js/stores/clips/new";

  export let index: number;
  export let track: Track;
  // TODO: find the clip in the `audio_clips` array with `index:` property === `index`
  $: item = Object.values($project[track.id].clips).find(
    (clip) => clip.index === index
  );
  $: items = !!item ? [item] : [];

  function consider(e: any) {
    items = e.detail.items
  }

  function finalize(e: any) {
    const dragged = e.detail.items.find(
      (item: any) => item.track_id !== track.id
    );
    items = e.detail.items
    newClipFromPool(dragged, track.id, index);
  }

  $: options = {
    dropFromOthersDisabled: !!item,
    items: items,
    flipDurationMs: 0,
  };
</script>

<div
  class="box-content border-2 rounded h-8 w-36"
  use:dndzone={options}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as clip (clip.id)}
    <Clip {clip} />
  {/each}
</div>
