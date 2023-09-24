<script lang="ts">
  import { onMount } from "svelte";
  import { tracksToClipArrays } from "js/utils";
  import clipStore from "js/stores/clips";
  import transportStore from "js/stores/transport";
  import type { HTMLInputEvent, Clip } from "js/types";
  import { setPlaybackRate, updateClipProperties } from "js/clip";

  const { setBpm } = transportStore;

  $: clipArrays = tracksToClipArrays($clipStore);

  function stretchClipsToBpm(bpm: number) {
    const clipsToStretch: Clip[] = [];
    for (const track of clipArrays) {
      for (const clip of track) {
        if (!!clip.audio_file) {
          const rate = bpm / clip.audio_file.bpm;
          setPlaybackRate(clip, rate);
        }
        clipsToStretch.push(clip);
      }
    }
    updateClipProperties(...clipsToStretch);
  }

  function setTransportBpm(e: HTMLInputEvent) {
    const bpm = parseInt(e.currentTarget.value);
    // TODO: make this e2e reactive
    setBpm(bpm);
    stretchClipsToBpm(bpm);
  }

  onMount(async () => setBpm(120));
</script>

<div class="flex flex-col items-center">
  <div class="mb-8">
    <input
      class="w-22 h-16 rounded-lg border-4 text-lg"
      id="tempo"
      value={$transportStore.bpm}
      type="number"
      min="40"
      max="250"
      step="1"
      on:change={setTransportBpm}
    />
  </div>
</div>
