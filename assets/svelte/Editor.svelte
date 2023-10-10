<script lang="ts">
  import { afterUpdate } from "svelte";
  import { flash } from "js/utils";
  import { get } from "svelte/store"
  import selectedStore from "js/stores/selected";
  import type { SelectedStore } from "js/stores/selected";
  import trackDataStore from "js/stores/track-data";
  import playerStore from "js/stores/players";
  import WaveSurfer from "wavesurfer.js";
  import Regions from "wavesurfer.js/dist/plugins/regions.js";
  import type { RegionParams } from "wavesurfer.js/dist/plugins/regions.js";
  import type { Clip, TrackData } from "js/types";
  import clipMessage from "js/clip";

  let waveformContainer: HTMLElement;
  let waveform: any;
  let region: any;

  afterUpdate(() => {
    flash(waveformContainer);
  });

  function getSelectedClip(selected: SelectedStore, trackData: TrackData[]) {
    if (selected.clipId && selected.trackId) {
      return trackData
        .find((track) => track.id === selected.trackId)
        ?.audio_clips.find((clip: Clip) => clip.id === selected.clipId);
    }
  }

  function drawWaveform(currentClip?: Clip) {
    if (!!waveform) waveform.destroy();

    if (!!currentClip?.audio_file) {
      const clipDuration = get(playerStore)[currentClip.id].grainPlayer!.buffer.duration
      waveform = WaveSurfer.create({
        container: waveformContainer,
        waveColor: "#06b6d4",
        progressColor: "#06b6d4",
        interact: false,
        cursorWidth: 0,
        url: currentClip.audio_file.file.url,
      });
      region = waveform.registerPlugin(Regions.create());
      waveform.on("decode", () => {
        const regionParams: RegionParams = {
          start: currentClip.start_time,
          end: clipDuration,
          color: "rgba(34, 211, 238, 0.5)",
          drag: true,
          resize: true,
        };
        if (currentClip.end_time) {
          regionParams.end = currentClip.end_time;
        }
        region.addRegion(regionParams);
      });
      region.on("region-updated", (region: any) => {
        clipMessage.push.updateClips({
          ...currentClip,
          start_time: region.start,
          end_time: region.end,
        });
      });
    }
  }

  $: selectedClip = getSelectedClip($selectedStore, $trackDataStore);
  $: drawWaveform(selectedClip);
</script>

<section class="p-4">
  <div bind:this={waveformContainer} class="placeholder h-20 w-full" />
</section>
