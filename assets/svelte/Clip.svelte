<script lang="ts">
  import tracks from "js/stores/tracks";
  import { PlayState } from "js/stores/types";
  import type { HTMLInputEvent } from "js/stores/types";

  export let id: string;
  export let name: string;
  export let trackId: string;
  export let state: PlayState = PlayState.Stopped;
  export let playbackRate: number = 1;
  export let bpm: number = 0;

  const { addClip, playClips, stopClips, updateClipProperties } = tracks;

  $: clip = $tracks[trackId].clips[id];

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-base w-48 h-16 text-white rounded-l-lg";
  const stateStyles = {
    [PlayState.Playing]: "bg-red-500 hover:bg-red-700",
    [PlayState.Stopped]: "bg-green-500 hover:bg-green-700",
    [PlayState.Queued]: "bg-yellow-500 hover:bg-yellow-700",
  };

  $: clipStyles = baseStyles + " " + stateStyles[state];

  function changeClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    addClip(e.currentTarget.files[0], trackId, bpm, id);
  }

  function changeTempo(e: HTMLInputEvent) {
    updateClipProperties({
      ...clip,
      playbackRate: parseInt(e.currentTarget.value),
    });
  }

  function clipAction() {
    switch (state) {
      case PlayState.Stopped:
        playClips([clip]);
        break;
      case PlayState.Playing:
        stopClips([trackId]);
    }
  }
</script>

<div class="flex flex-row mb-2">
  <input
    id="clipchange-{id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  <button on:click={clipAction} class={clipStyles}>
    {name} - {bpm}BPM
  </button>
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label for="clipchange-{id}" class="inline-block py-5 min-h-full min-w-full"
      >change file</label
    >
  </div>
</div>
<input
  class="mb-2 w-64"
  type="range"
  min="0"
  step="0.01"
  max="2"
  bind:value={playbackRate}
  on:input={changeTempo}
/>
