<svelte:options immutable />

<script lang="ts">
  import { pushCreateEmptyTrack } from "js/track";
  import { Song } from "js/types";
  export let project: Song;
</script>

<button class="add-track" on:click={() => pushCreateEmptyTrack(project.id)}>
  <span class="hero-plus-circle h-full w-1/4 self-center" />
  <span class="self-center">Add track</span>
</button>

<style lang="postcss">
  .add-track {
    @apply flex h-8 w-36 justify-center rounded bg-green-500 p-1 text-lg text-white hover:bg-green-700;
  }
</style>
