<svelte:options immutable />

<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing"
  import selectedStore from "js/stores/selected";
  import type { SelectedStore } from "js/stores/selected";
  import trackDataStore from "js/stores/track-data";
  import samplerStore from "js/stores/samplers";
  import type { Clip, TrackData } from "js/types";
  import ClipProperties from "./ClipProperties.svelte";
  import ClipWaveform from "./ClipWaveform.svelte";

  $: clip = getSelectedClip($selectedStore, $trackDataStore);
  $: clipDuration = !!clip ? $samplerStore[clip.id].sampler!.duration : 0;

  function getSelectedClip(selected: SelectedStore, trackData: TrackData[]) {
    if (selected.clipId && selected.trackId) {
      return trackData
        .find((track) => track.id === selected.trackId)
        ?.audio_clips.find((clip: Clip) => clip.id === selected.clipId);
    }
  }

  function closeEditor() {
    selectedStore.set({ clipId: null, trackId: null });
  }
</script>

{#if !!clip}
  <section
    transition:slide={{ axis: "y", duration: 200, easing: cubicInOut }}
    class="mt-2 flex-col gap-y-2 rounded border-2 border-slate-200 p-4"
  >
    <div class="flex flex-row items-center justify-between">
      <div class="font-bold">{clip.name}</div>
      <button
        class="h-8 w-16 rounded bg-red-500 font-semibold text-white hover:bg-red-700"
        on:click={closeEditor}>close</button
      >
    </div>
    <ClipWaveform {clip} {clipDuration} />
    <ClipProperties {clip} {clipDuration} />
  </section>
{/if}
