<script lang="ts">
  import { onMount } from "svelte";
  import transportStore from "js/stores/transport";
  import type { HTMLInputEvent, Clip } from "js/types";
  import { pushUpdateClip } from "js/clip";
  import trackDataStore from "js/stores/track-data";
  import playerStore from "js/stores/players"

  const { setBpm } = transportStore;

  function stretchClipsToBpm(bpm: number) {
    const clipsToStretch: Clip[] = [];
    for (const track of $trackDataStore) {
      for (const clip of track.audio_clips) {
        if (!!clip.audio_file) {
          const rate = bpm / clip.audio_file.bpm;
          // optimistically change rate locally first
          playerStore.setPlaybackRate(clip, rate);
          clipsToStretch.push({ ...clip, playback_rate: rate });
        }
      }
    }
    pushUpdateClip(...clipsToStretch);
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
