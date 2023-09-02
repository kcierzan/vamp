<script lang="ts">
  import { Transport, Draw } from "tone";
  import { onMount } from "svelte";
  import transport from "js/stores/transport";
  import { PlayState } from "js/types";

  const zero = 0;
  const zeroPadded = zero.toFixed(2);
  const zeroPosition = "0:0:0";
  let playHeadPosition = "0:0:0";
  let seconds = zeroPadded;
  let stopHeldStyle = "";

  $: playing = $transport.state === PlayState.Playing;

  const buttonStyles =
    "text-base bg-gray-400  w-24 h-16 text-black rounded-lg mr-4";

  function measurePlayhead() {
    Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const [bars, beats, sixteenths] = $transport.transport.position
          .toString()
          .split(":");
        playHeadPosition = `${bars}:${beats}:${Math.floor(
          parseInt(sixteenths)
        )}`;
      }, time);
    }, "16n");
  }

  function measureSeconds() {
    Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const now =
          Math.round(($transport.transport.seconds + Number.EPSILON) * 100) /
          100;
        seconds = now.toFixed(2);
      }, time);
    }, "10hz");
  }

  function start() {
    playHeadPosition = zeroPosition;
    seconds = zeroPadded;
    // TODO: this should push a message
    transport.start(undefined);
  }

  function stop() {
    // FIXME: This should push a message that invokes track.stopAudio
    transport.stop();
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

<div class="flex flex-row">
  <button
    class={buttonStyles}
    class:bg-green-500={playing}
    class:text-white={playing}
    on:click={start}>Play</button
  >
  <button
    class={buttonStyles + " " + stopHeldStyle}
    on:click={stop}
    on:mousedown={holdStop}
    on:mouseup={releaseStop}>Stop</button
  >
  <div class="flex-column justify-center w-32">
    <div class="pt-2">Transport: {playHeadPosition}</div>
    <div>Seconds: {seconds}</div>
  </div>
</div>
