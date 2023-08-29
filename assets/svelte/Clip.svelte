<script lang="ts">
  import { PlayState } from "js/types";
  import type { HTMLInputEvent, PlayableClip } from "js/types";
  import { playClips } from "js/stores/clips/play";
  import { stopClips } from "js/stores/clips/stop";
  import { newClip } from "js/stores/clips/new";
  import { updateClipProperties } from "js/stores/clips/update";

  export let clip: PlayableClip;

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-base w-48 h-16 text-white rounded-l-lg";
  const stateStyles = {
    [PlayState.Playing]: "bg-red-500 hover:bg-red-700",
    [PlayState.Stopped]: "bg-green-500 hover:bg-green-700",
    [PlayState.Queued]: "bg-yellow-500 hover:bg-yellow-700",
  };

  function computeStyles(clip: PlayableClip) {
    const base = baseStyles + " "
    if (!clip.playable) {
      return base + "bg-green-200";
    }
    return base + stateStyles[clip.state];
  }

  $: clipStyles = computeStyles(clip);

  function changeClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    newClip(e.currentTarget.files[0], clip.trackId, clip.bpm, clip.id);
  }

  function changeTempo(e: HTMLInputEvent) {
    updateClipProperties({
      ...clip,
      playbackRate: parseInt(e.currentTarget.value),
    });
  }

  function clipAction() {
    if (!clip.playable) return;
    switch (clip.state) {
      case PlayState.Stopped:
        playClips([clip]);
        break;
      case PlayState.Playing:
        stopClips([clip.trackId]);
    }
  }
</script>

<div class="flex flex-row mb-2">
  <input
    id="clipchange-{clip.id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  <button on:click={clipAction} class={clipStyles}>
    {clip.name} - {clip.bpm}BPM
  </button>
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label
      for="clipchange-{clip.id}"
      class="inline-block py-5 min-h-full min-w-full">change file</label
    >
  </div>
</div>
<input
  class="mb-2 w-64"
  type="range"
  min="0"
  step="0.01"
  max="2"
  bind:value={clip.playbackRate}
  on:input={changeTempo}
/>
