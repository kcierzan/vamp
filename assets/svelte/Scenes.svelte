<script lang="ts">
  import scenesStore from "../js/stores/scenes";
  import SceneButton from "./SceneButton.svelte";
</script>

{#if $scenesStore.scenes}
  <div class="flex flex-col items-center gap-1">
    {#each $scenesStore.scenes as _, index}
      <SceneButton {index} state={$scenesStore.states[index]} />
    {/each}
  </div>
{/if}
