<script lang="ts">
  import { afterUpdate } from "svelte";
  import { flash } from "js/utils";
  import selectedStore  from "js/stores/selected";
  import type { SelectedStore } from "js/stores/selected";
  import trackDataStore from "js/stores/track-data";
  import WaveSurfer from "wavesurfer.js";
  import Regions from "wavesurfer.js/plugins/regions";
  import type { Clip, TrackData } from "js/types";

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
        region.addRegion({
          start: 0,
          end: 1,
          color: "rgba(34, 211, 238, 0.5)",
          drag: true,
          resize: true,
        });
      });
    }
  }

  $: drawWaveform(getSelectedClip($selectedStore, $trackDataStore));
</script>

<section class="p-4">
  <div bind:this={waveformContainer} class="placeholder h-20 w-full" />
</section>
