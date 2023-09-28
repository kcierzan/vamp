<svelte:options immutable />
<script lang="ts">
  import { afterUpdate } from "svelte";
  import { Song } from "js/types";
  import { flash } from "js/utils";
  import AddTrackButton from "./AddTrackButton.svelte";
  import Tempo from "./Tempo.svelte";
  import Transport from "./Transport.svelte";
  import Quantization from "./Quantization.svelte";
  import Metronome from "./Metronome.svelte";
  export let project: Song;
  let element: HTMLElement;

  afterUpdate(() => flash(element));
</script>

<div
  class="flex flex-row items-center justify-center space-x-4"
  bind:this={element}
>
  <AddTrackButton {project} />
  <Transport />
  <Tempo />
  <Quantization />
  <Metronome />
</div>
