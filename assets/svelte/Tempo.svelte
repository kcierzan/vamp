<script>
  import { onMount } from "svelte";
  import { tracksToClipArrays } from "js/utils";
  import transport from "../js/stores/transport";
  import tracks from "../js/stores/tracks";

  const { setBpm } = transport;
  const { updateClipProperties } = tracks;

  $: clipArrays = tracksToClipArrays($tracks);

  function stretchClipsToBpm(bpm) {
    for (const track of clipArrays) {
      for (const clip of track) {
        const rate = bpm / clip.bpm;
        updateClipProperties({ ...clip, playbackRate: rate });
      }
    }
  }

  function setTransportBpm() {
    // TODO: update all the clip playbackRates based on their BPM and the new tempo
    // TODO: make this e2e reactive
    setBpm(this.value);
    stretchClipsToBpm(this.value);
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
