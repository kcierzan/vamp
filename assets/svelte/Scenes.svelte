<script lang="ts">
  import scenes from "../js/stores/scenes";
  import SceneButton from "./SceneButton.svelte";
</script>

{#if $scenes.scenes}
  <div class="flex flex-col items-center gap-1">
    {#each $scenes.scenes as _, index}
      <SceneButton {index} state={$scenes.states[index]} />
    {/each}
  </div>
{/if}
