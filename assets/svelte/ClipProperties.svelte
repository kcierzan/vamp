<script lang="ts">
  import instruments from "js/instruments";
  import { round } from "js/utils";
  import { selectedStore } from "js/stores";

  $: clipDuration = !!$selectedStore.clip
    ? instruments.getClipDuration($selectedStore.clip.id)
    : 0;
</script>

{#if !!$selectedStore.clip}
  <div class="flex flex-row gap-x-2">
    <div>
      <span class="font-semibold">BPM: </span>
      {$selectedStore.clip.audio_file?.bpm ?? "N/A"}
    </div>
    <div>
      <span class="font-semibold">Playback Rate: </span>
      {$selectedStore.clip.playback_rate}
    </div>
    <div>
      <span class="font-semibold">Start: </span>
      {round($selectedStore.clip.start_time, 1_000)}
    </div>
    <div>
      <span class="font-semibold">End: </span>
      {!!$selectedStore.clip.end_time
        ? round($selectedStore.clip.end_time, 1_000)
        : round(clipDuration, 1_000)}
    </div>
    <div>
      <span class="font-semibold">Size: </span>
      {!!$selectedStore.clip.audio_file
        ? `${round($selectedStore.clip.audio_file.size / 1_000_000, 10_000)} MB`
        : "N/A"}
    </div>
  </div>
{/if}
