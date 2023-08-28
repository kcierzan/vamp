<script lang="ts">
  import { onMount } from "svelte";
  import { tracksToClipArrays } from "js/utils";
  import transport from "js/stores/transport";
  import vampset from "js/stores/vampset";
  import type { HTMLInputEvent } from "js/types";
  import { updateClipProperties } from "js/stores/clips/update";

  const { setBpm } = transport;

  $: clipArrays = tracksToClipArrays($vampset);

  // FIXME: Should be in the clip class?
  function stretchClipsToBpm(bpm: number) {
    for (const track of clipArrays) {
      for (const clip of track) {
        const rate = bpm / clip.bpm;
        updateClipProperties({ ...clip, playbackRate: rate });
      }
    }
  }

  function setTransportBpm(e: HTMLInputEvent) {
    // TODO: update all the clip playbackRates based on their BPM and the new tempo
    // TODO: make this e2e reactive
    const bpm = parseInt(e.currentTarget.value);
    setBpm(bpm);
    stretchClipsToBpm(bpm);
  }

  onMount(async () => setBpm(128));
</script>

<div>
  <label for="tempo">BPM</label>
</div>
<div class="mb-8">
  <input
    class="w-22"
    id="tempo"
    value={$transport.transport?.bpm?.value}
    type="number"
    min="40"
    max="250"
    step="1"
    on:change={setTransportBpm}
  />
</div>
