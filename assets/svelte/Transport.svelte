<script lang="ts">
  import transportStore from "js/stores/transport";
  import transportMessage from "js/messages/transport";
  import { PlayState } from "js/types";

  let stopHeldStyle = "";

  $: playing = $transportStore.state === PlayState.Playing;

  const buttonStyles = "text-base bg-gray-400 w-16 h-8 text-black rounded-lg";

  function holdStop() {
    stopHeldStyle = "text-white bg-red-500";
  }

  function releaseStop() {
    stopHeldStyle = "";
  }
</script>

<div class="flex flex-row items-center space-x-4">
  <button
    class={buttonStyles}
    class:bg-green-500={playing}
    class:text-white={playing}
    on:click={() => transportMessage.start()}>Play</button
  >
  <button
    class={buttonStyles + " " + stopHeldStyle}
    on:click={() => transportMessage.stop()}
    on:mousedown={holdStop}
    on:mouseup={releaseStop}>Stop</button
  >
  <div class="flex-column w-32 justify-center text-xs">
    <div>Transport: {$transportStore.barsBeatsSixteenths}</div>
    <div>Seconds: {$transportStore.seconds}</div>
  </div>
</div>
