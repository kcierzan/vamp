<script lang="ts">
  import { PlayState } from "js/types";
  import type { HTMLInputEvent } from "js/types";
  import { playClips } from "js/stores/clips/play";
  import { newClip } from "js/stores/clips/new";
  import { updateClipProperties } from "js/stores/clips/update";
  import { debounce } from "js/utils";
  import Clip from "js/clip";

  export let clip: Clip;

  // TODO: extract this to PlayableButton or something
  const baseStyles =
    "flex justify-between text-base w-48 h-16 text-white rounded-l-lg ";
  const stateStyles = {
    [PlayState.Playing]: "bg-sky-400 hover:bg-sky-300",
    [PlayState.Stopped]: "bg-blue-500 hover:bg-blue-400",
    [PlayState.Queued]: "blink",
  };

  function computeStyles(clip: Clip) {
    const base = baseStyles + " ";
    if (!clip.playable) {
      return base + "bg-blue-200";
    }
    return base + stateStyles[clip.state];
  }

  $: clipStyles = computeStyles(clip);

  function changeClip(e: HTMLInputEvent) {
    if (!e.currentTarget.files) return;
    newClip(e.currentTarget.files[0], clip.trackId, clip.id);
  }

  function changeTempo(e: HTMLInputEvent) {
    const target = e.target;
    const val = (target as HTMLInputElement).value;
    updateClipProperties({
      ...clip.serialize(),
      playbackRate: parseFloat(val),
    });
  }
</script>

<div>
  <div class="flex flex-row mb-2">
    <input
      id="clipchange-{clip.id}"
      type="file"
      class="hidden"
      on:change={changeClip}
    />
    <button on:click={() => playClips([clip])} class={clipStyles}>
      <span class="hero-play self-center m-2 h-8 w-8 min-w-8 min-h-8" />
      <span class="text-left self-center w-36 truncate">{clip.name}</span>
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
</div>
<input
  class="mb-2 w-64"
  type="range"
  min="0.2"
  step="0.01"
  max="2"
  bind:value={clip.playbackRate}
  on:input={debounce(changeTempo)}
/>

<style>
  .blink {
    /* TODO: we can probably do svelte string interpolation here to sync animation with bpm */
    animation: buttonbg 0.2s 0s ease-in infinite alternate;
  }

  @keyframes buttonbg {
    from {
      background-color: rgb(59 130 246);
    }
    to {
      background-color: rgb(234 179 8);
    }
  }
</style>
