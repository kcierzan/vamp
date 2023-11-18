<svelte:options immutable />

<script lang="ts">
  import { Song } from "js/types";
  import trackMessage from "js/messages/track";
  export let song: Song;
</script>

<button class="add-track" on:click={() => trackMessage.createEmpty(song.id)}>
  <span class="hero-plus-circle h-full w-1/4 self-center" />
  <span class="self-center">Add track</span>
</button>

<style lang="postcss">
  .add-track {
    @apply flex h-8 w-36 justify-center rounded bg-green-500 p-1 text-lg text-white hover:bg-green-700;
  }
</style>
