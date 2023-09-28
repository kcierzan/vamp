<script lang="ts">
  import { onMount } from "svelte";
  import { Transport, Draw, Oscillator, AmplitudeEnvelope } from "tone";

  let beat: number = 1;
  let on = false;
  let events: number[] = [];
  let upOsc: Oscillator | undefined;
  let osc: Oscillator | undefined;
  let upEnvelope: AmplitudeEnvelope | undefined;
  let envelope: AmplitudeEnvelope | undefined;

  function createOscillators() {
    upOsc = new Oscillator(880, "sine");
    osc = new Oscillator(440, "sine");
    upEnvelope = new AmplitudeEnvelope({
      attack: 0.015,
      decay: 0.2,
      sustain: 0,
      release: 0.05,
    }).toDestination();
    envelope = new AmplitudeEnvelope({
      attack: 0.015,
      decay: 0.2,
      sustain: 0,
      release: 0.05,
    }).toDestination();
  }

  function scheduleBeats() {
    if (!osc || !envelope || !upEnvelope || !upOsc) return;
    osc.connect(envelope).start();
    upOsc.connect(upEnvelope).start();
    const scheduled = [0, 1, 2, 3].map((currentBeat) => {
      return Transport.scheduleRepeat(
        (time) => {
          if (currentBeat === 0) {
            upOsc?.restart(time);
            upEnvelope?.triggerAttackRelease(0.2, time);
          } else {
            osc?.restart(time);
            envelope?.triggerAttackRelease(0.2, time);
          }
          Draw.schedule(() => {
            beat = currentBeat + 1;
          }, time);
        },
        "1m",
        `0:${currentBeat}`,
      );
    });
    events = [...events, ...scheduled];
  }

  function clearEvents() {
    for (const eventId of events) {
      Transport.clear(eventId);
    }
    events = [];
  }

  async function toggle() {
    if (on) {
      clearEvents();
      on = false;
      beat = 1;
    } else {
      on = true;
      scheduleBeats();
    }
  }
  onMount(async () => createOscillators());
</script>

<button
  class="text-base bg-gray-400 w-16 h-8 text-black rounded-lg"
  class:bg-yellow-500={on}
  on:click={toggle}>{beat}</button
>
