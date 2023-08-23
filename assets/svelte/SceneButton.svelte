<script>
  import scenes from "../js/stores/scenes";

  export let index;
  export let state;

  const { playScene } = scenes;

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-base w-24 h-16 text-white mb-8 rounded-lg";
  const stateStyles = {
    playing: "bg-red-500 hover:bg-red-700",
    stopped: "bg-green-500 hover:bg-green-700",
    queued: "bg-yellow-500 hover:bg-yellow-700 text-black",
  };

  $: sceneStyles = baseStyles + " " + stateStyles[state];
</script>

<div>
  <button class={sceneStyles} on:click={() => playScene(index)}
    >Scene {index + 1}</button
  >
</div>
