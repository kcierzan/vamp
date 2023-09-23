<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import ClipComponent from "./Clip.svelte";
  import { AudioFile, Clip, Track, DndItem } from "js/types";
  import { newClipFromPool } from "js/stores/clips/new";
  import { isClip, serialize } from "js/clip";
  import { isAudioFile } from "js/audio-file";
  import { updateClipProperties } from "js/stores/clips/update";

  export let index: number;
  export let track: Track;
  let items: DndItem[];
  let considering = false;
  $: dndBg = considering ? "bg-orange-500" : "bg-transparent";
  $: occupyingClip = Object.values($project[track.id].clips).find(
    (clip) => clip.index === index,
  );
  $: items = !!occupyingClip ? [occupyingClip] : [];

  function consider(e: CustomEvent<DndEvent<any>>) {
    considering = !!e.detail.items.length;
    items = e.detail.items;
  }

  function finalize(e: CustomEvent<DndEvent<any>>) {
    const audioFile = e.detail.items.find((item) => isAudioFile(item));
    const clip = e.detail.items.find((item) => isClip(item));

    considering = false;
    items = e.detail.items;
    if (!!audioFile) {
      newClipFromPool(audioFile, track.id, index);
    } else if (!!clip) {
      project.update((store) => {
        delete store[clip.track_id].clips[clip.id];
        return store;
      });
      updateClipProperties(serialize({ ...clip, index, track_id: track.id }));
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
