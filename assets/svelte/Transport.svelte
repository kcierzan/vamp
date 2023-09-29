<script lang="ts">
  import { Transport, Draw } from "tone";
  import { onMount } from "svelte";
  import transportStore from "js/stores/transport";
  import { PlayState } from "js/types";

  const zero = 0;
  const zeroPadded = zero.toFixed(2);
  const zeroPosition = "0:0:0";
  let playHeadPosition = "0:0:0";
  let seconds = zeroPadded;
  let stopHeldStyle = "";

  $: playing = $transportStore.state === PlayState.Playing;

  const buttonStyles = "text-base bg-gray-400 w-16 h-8 text-black rounded-lg";

  function measurePlayhead() {
    Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const [bars, beats, sixteenths] = $transportStore.transport.position
          .toString()
          .split(":");
        playHeadPosition = `${bars}:${beats}:${Math.floor(
          parseInt(sixteenths),
        )}`;
      }, time);
    }, "16n");
  }

  function measureSeconds() {
    Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const now =
          Math.round(
            ($transportStore.transport.seconds + Number.EPSILON) * 100,
          ) / 100;
        seconds = now.toFixed(2);
      }, time);
    }, "10hz");
  }

  function start() {
    playHeadPosition = zeroPosition;
    seconds = zeroPadded;
    transportStore.start();
  }

  onMount(async () => {
    measurePlayhead();
    measureSeconds();
  });

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
    on:click={start}>Play</button
  >
  <button
    class={buttonStyles + " " + stopHeldStyle}
    on:click={() => transportStore.stop()}
    on:mousedown={holdStop}
    on:mouseup={releaseStop}>Stop</button
  >
  <div class="flex-column w-32 justify-center text-xs">
    <div>Transport: {playHeadPosition}</div>
    <div>Seconds: {seconds}</div>
  </div>
</div>
