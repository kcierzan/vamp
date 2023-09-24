<svelte:options immutable />

<script lang="ts">
  import { PlayState } from "js/types";
  import type { Clip, HTMLInputEvent } from "js/types";
  import { playClips, updateClipProperties } from "js/clip";
  import { Transport } from "tone";

  export let clip: Clip;
  let button: HTMLButtonElement;
  let animation: Animation | null = null;

  function handleQueueAnimation(state: PlayState) {
    if (!!!animation && state === PlayState.Queued) {
      animation = button.animate(
        [
          {
            backgroundColor: "#eab308",
          },
          {
            backgroundColor: "#0ea5e9",
          },
        ],
        {
          easing: "ease-in",
          iterations: Infinity,
          direction: "alternate",
          duration: (30 / Transport.bpm.value) * 1000,
        },
      );
    } else if (state === PlayState.Stopped || state === PlayState.Playing) {
      !!animation && animation.cancel();
      animation = null;
    }
  }

  $: handleQueueAnimation(clip.state);

  // TODO: extract this to PlayableButton or something
  const baseStyles = "flex text-base w-36 h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-sky-400",
    [PlayState.Stopped]: "bg-blue-500",
    [PlayState.Queued]: "",
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
      ...clip,
      playback_rate: parseFloat(val),
    });
  }
</script>

<div class="flex flex-row">
  <button
    on:click={() => playClips(clip)}
    class={clipStyles}
    bind:this={button}
  >
    <span class="hero-play ml-2 h-4 w-6 self-center" />
    <span class="w-30 self-center truncate text-left">{clip.name}</span>
  </button>
</div>

<style>
  .empty::after {
    content: "\200B";
    visibility: hidden;
  }
</style>
