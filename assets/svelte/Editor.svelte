<script lang="ts">
  import { afterUpdate } from "svelte";
  import { flash, round } from "js/utils";
  import selectedStore from "js/stores/selected";
  import type { SelectedStore } from "js/stores/selected";
  import trackDataStore from "js/stores/track-data";
  import playerStore from "js/stores/players";
  import WaveSurfer from "wavesurfer.js";
  import Regions from "wavesurfer.js/dist/plugins/regions.js";
  import type {
    Region,
    RegionParams,
  } from "wavesurfer.js/dist/plugins/regions.js";
  import type { Clip, TrackData } from "js/types";
  import clipMessage from "js/clip";

  let waveformContainer: HTMLElement;
  let waveform: WaveSurfer;

  afterUpdate(() => {
    flash(waveformContainer);
  });

  $: selectedClip = getSelectedClip($selectedStore, $trackDataStore);
  $: selectedClipDuration = !!selectedClip
    ? $playerStore[selectedClip.id].grainPlayer!.buffer.duration
    : 0;
  $: drawWaveform(selectedClip);

  function drawWaveform(currentClip?: Clip) {
    !!waveform && waveform.destroy();
    if (!!currentClip?.audio_file) {
      waveform = WaveSurfer.create({
        container: waveformContainer,
        waveColor: "#06b6d4",
        interact: false,
        cursorWidth: 0,
        url: currentClip.audio_file.file.url,
      });
      waveform.on("decode", () => createPlaybackRegion(currentClip, waveform));
    }
  }

  function createPlaybackRegion(currentClip: Clip, waveform: WaveSurfer) {
    const regions = waveform.registerPlugin(Regions.create());
    const regionParams: RegionParams = {
      start: currentClip.start_time,
      end: currentClip.end_time ?? selectedClipDuration,
      color: "rgba(34, 211, 238, 0.5)",
      drag: true,
      resize: true,
    };
    regions.addRegion(regionParams);
    regions.on("region-updated", (region: Region) => {
      clipMessage.push.updateClips({
        ...currentClip,
        start_time: region.start,
        end_time: region.end,
      });
    });
  }

  function getSelectedClip(selected: SelectedStore, trackData: TrackData[]) {
    if (selected.clipId && selected.trackId) {
      return trackData
        .find((track) => track.id === selected.trackId)
        ?.audio_clips.find((clip: Clip) => clip.id === selected.clipId);
    }
  }

  function closeEditor() {
    !!waveform && waveform.destroy();
    selectedStore.set({ clipId: null, trackId: null });
  }
</script>

<section
  class="mt-2 flex-col gap-y-2 rounded {!!selectedClip
    ? 'border-2 border-slate-200 p-4'
    : ''}"
>
  {#if !!selectedClip}
    <div class="flex flex-col justify-center">
      <div class="flex flex-row justify-between">
        <div class="font-bold">{selectedClip.name}</div>
        <button class="rounded bg-red-500 text-white w-16 h-8 font-semibold hover:bg-red-700" on:click={closeEditor}
          >close</button
        >
      </div>
      <div class="flex flex-row gap-x-2">
        <div>
          <span class="font-semibold">BPM: </span>
          {selectedClip.audio_file?.bpm ?? "N/A"}
        </div>
        <div>
          <span class="font-semibold">Playback Rate: </span>
          {selectedClip.playback_rate}
        </div>
        <div>
          <span class="font-semibold">Start: </span>
          {round(selectedClip.start_time, 1_000)}
        </div>
        <div>
          <span class="font-semibold">End: </span>
          {!!selectedClip.end_time
            ? round(selectedClip.end_time, 1_000)
            : round(selectedClipDuration, 1_000)}
        </div>
        <div>
          <span class="font-semibold">Size: </span>
          {!!selectedClip.audio_file
            ? `${round(selectedClip.audio_file.size / 1_000_000, 10_000)} MB`
            : "N/A"}
        </div>
      </div>
    </div>
  {/if}
  <div bind:this={waveformContainer} class="mt-2" />
</section>
