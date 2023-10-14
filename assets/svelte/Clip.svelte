<script lang="ts">
  import { PlayState } from "js/types";
  import type { Clip, HTMLInputEvent } from "js/types";
  import * as Tone from "tone";
  import clipMessage from "js/messages/clip";
  import { Transport } from "tone";
  import clipsStore from "js/stores/clips";
  import selectedStore from "js/stores/selected";

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
    } else {
      !!animation && animation.cancel();
      animation = null;
    }
  }

  $: handleQueueAnimation($clipsStore[clip.id].state);

  // TODO: extract this to PlayableButton or something
  const baseStyles = "flex text-base w-full h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-sky-400",
    [PlayState.Stopped]: "bg-blue-500",
    [PlayState.Queued]: "",
    [PlayState.Paused]: "",
  };

  function computeStyles(state: PlayState) {
    const base = baseStyles + " ";
    return base + stateStyles[state];
  }

  $: clipStyles = computeStyles($clipsStore[clip.id].state);

  function changeTempo(e: HTMLInputEvent) {
    const target = e.target;
    const val = (target as HTMLInputElement).value;
    clipMessage.push.updateClips({
      ...clip,
      playback_rate: parseFloat(val),
    });
  }

  async function clickClip(e: MouseEvent) {
    await Tone.start();

    if (!!e.shiftKey) {
      selectedStore.set({ clipId: clip.id, trackId: clip.track_id });
    } else {
      clipMessage.push.playClips(clip);
    }
  }
</script>

<div class="flex flex-row">
  <button on:click={clickClip} class={clipStyles} bind:this={button}>
    <span class="hero-play ml-2 h-4 w-6 self-center" />
    <span class="w-30 self-center truncate text-left">{clip.name}</span>
  </button>
</div>
