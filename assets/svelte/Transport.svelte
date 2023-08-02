<script>
  import { onMount } from "svelte";
  import Button from "./Button.svelte";

  let osc;
  let transport;
  let metronome;
  let metronomeOn = false;

  function startMetronome() {
    metronome = transport.scheduleRepeat((time) => {
      osc.start(time).stop(time + 0.1);
    }, "4n");
    metronomeOn = true;
  }

  function stopMetronome() {
    transport.clear(metronome);
    metronomeOn = false;
  }

  function toggleMetronome() {
    metronomeOn ? stopMetronome() : startMetronome();
  }

  function play() {
    if (metronomeOn) {
      stopMetronome();
      startMetronome();
    }
    transport.start();
  }

  onMount(async () => {
    const { Oscillator, Transport } = await import("tone");
    osc = new Oscillator().toDestination();
    transport = Transport;
  });
</script>

<div class="flex justify-stretch my-3 gap-3">
  <Button onClick={play} classes="w-full">Play</Button>
  <Button onClick={() => transport.pause()} classes="w-full">Pause</Button>
  <Button onClick={() => transport.stop()} negative={true} classes="w-full">Stop</Button>
  <Button onClick={toggleMetronome} classes="w-full"
    >Metronome {metronomeOn ? "ON" : "OFF"}</Button
  >
</div>
