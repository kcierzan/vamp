<script lang="ts">
  import { onMount } from "svelte";
  import { tracksToClipArrays } from "js/utils";
  import transport from "js/stores/transport";
  import project from "js/stores/project";
  import type { HTMLInputEvent } from "js/types";
  import { updateClipProperties } from "js/stores/clips/update";
  import { Clip, serialize, setPlaybackRate } from "js/clip";

  const { setBpm } = transport;

  $: clipArrays = tracksToClipArrays($project);

  function stretchClipsToBpm(bpm: number) {
    const clipsToStretch: Clip[] = [];
    for (const track of clipArrays) {
      for (const clip of track) {
        if (!!clip.audio) {
          const rate = bpm / clip.audio.bpm;
          setPlaybackRate(clip, rate);
        }
        clipsToStretch.push(serialize(clip));
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
      class="text-lg w-22 h-16 border-4 rounded-lg"
      id="tempo"
      value={$transport.bpm}
      type="number"
      min="40"
      max="250"
      step="1"
      on:change={setTransportBpm}
    />
  </div>
</div>
