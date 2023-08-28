<script lang="ts">
  import { PlayState } from "js/types";
  import scenes from "../js/stores/scenes";

  export let index: number;
  export let state: PlayState;

  // FIXME: should clicking an already playing scene stop it?
  const { playScene } = scenes;

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-base w-24 h-16 text-white mb-8 rounded-lg";
  const stateStyles = {
    [PlayState.Playing]: "bg-red-500 hover:bg-red-700",
    [PlayState.Stopped]: "bg-green-500 hover:bg-green-700",
    [PlayState.Queued]: "bg-yellow-500 hover:bg-yellow-700 text-black",
  };

  $: sceneStyles = baseStyles + " " + stateStyles[state];
</script>

<div>
  <button class={sceneStyles} on:click={() => playScene(index)}
    >Scene {index + 1}</button
  >
</div>
