<script lang="ts">
  import type { Clip } from "js/types";
  import { round } from "js/utils";

  export let clip: Clip;
  export let clipDuration: number;
</script>

<div class="flex flex-row gap-x-2">
  <div>
    <span class="font-semibold">BPM: </span>
    {clip.audio_file?.bpm ?? "N/A"}
  </div>
  <div>
    <span class="font-semibold">Playback Rate: </span>
    {clip.playback_rate}
  </div>
  <div>
    <span class="font-semibold">Start: </span>
    {round(clip.start_time, 1_000)}
  </div>
  <div>
    <span class="font-semibold">End: </span>
    {!!clip.end_time ? round(clip.end_time, 1_000) : round(clipDuration, 1_000)}
  </div>
  <div>
    <span class="font-semibold">Size: </span>
    {!!clip.audio_file
      ? `${round(clip.audio_file.size / 1_000_000, 10_000)} MB`
      : "N/A"}
  </div>
</div>
