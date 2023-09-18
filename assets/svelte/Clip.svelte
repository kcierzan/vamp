<script lang="ts">
  import { PlayState } from "js/types";
  import type { Clip, HTMLInputEvent } from "js/types";
  import { playClips } from "js/stores/clips/play";
  import { updateClipProperties } from "js/stores/clips/update";
  import { serialize } from "js/clip";

  export let clip: Clip;

  // TODO: extract this to PlayableButton or something
  const baseStyles = "flex text-base w-36 h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-sky-400",
    [PlayState.Stopped]: "bg-blue-500",
    [PlayState.Queued]: "blink",
  };

  function computeStyles(clip: Clip) {
    const base = baseStyles + " ";
    return base + stateStyles[clip.state];
  }

  $: clipStyles = computeStyles(clip);

  function changeTempo(e: HTMLInputEvent) {
    const target = e.target;
    const val = (target as HTMLInputElement).value;
    updateClipProperties({
      ...serialize(clip),
      playback_rate: parseFloat(val),
    });
  }
</script>

{#if clip}
  <div>
    <div class="flex flex-row">
      <button on:click={() => playClips([clip])} class={clipStyles}>
        <span class="hero-play self-center ml-2 h-4 w-6" />
        <span class="text-left self-center w-30 truncate">{clip.name}</span>
      </button>
    </div>
  </div>
{:else}
  <div class="h-8 w-8 empty" />
{/if}

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

  .empty::after {
    content: "\200B";
    visibility: hidden;
  }
</style>
