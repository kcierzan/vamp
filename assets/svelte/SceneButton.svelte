<script lang="ts">
  import { PlayState } from "js/types";
  import scenes from "js/stores/scenes";

  export let index: number;
  export let state: PlayState;

  const { playScene, stopScene } = scenes;

  function sceneAction() {
    switch (state) {
      case PlayState.Stopped:
        playScene(index);
        break;
      case PlayState.Playing:
        stopScene(index);
    }
  }

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-sm w-20 h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-red-500 hover:bg-red-700",
    [PlayState.Stopped]: "bg-green-500 hover:bg-green-700",
    [PlayState.Queued]: "bg-yellow-500 hover:bg-yellow-700 text-black",
  };

  $: sceneStyles = baseStyles + " " + stateStyles[state];
</script>

<div>
  <button class={sceneStyles} on:click={sceneAction}>Scene {index + 1}</button>
</div>
