<svelte:options immutable />

<script lang="ts">
  import { Song } from "js/types";
  import AddTrackButton from "./AddTrackButton.svelte";
  import Tempo from "./Tempo.svelte";
  import Transport from "./Transport.svelte";
  import Quantization from "./Quantization.svelte";
  import Metronome from "./Metronome.svelte";

  export let song: Song;
  let element: HTMLElement;
</script>

<div
  class="my-4 flex flex-row items-center justify-center space-x-4"
  bind:this={element}
>
  <AddTrackButton {song} />
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>
