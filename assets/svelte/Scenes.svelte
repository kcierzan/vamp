<script lang="ts">
  import scenesStore from "../js/stores/scenes";
  import SceneButton from "./SceneButton.svelte";

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS,
  }));
</script>

{#if $scenesStore.scenes}
  <div class="mr-2 mt-0.5 flex flex-col items-start gap-1 rounded pt-9">
    {#each slots as slot, index (slot.id)}
      {#if Object.keys($scenesStore.scenes).includes(index.toString())}
        <div class="box-content rounded border-2 border-white">
          <SceneButton
            index={index.toString()}
            clips={$scenesStore.scenes[index.toString()]}
            state={$scenesStore.states[index.toString()]}
          />
        </div>
      {:else}
        <div class="box-content rounded border-2 border-white">
          <div class="placeholder h-8 w-20 rounded" />
        </div>
      {/if}
    {/each}
  </div>
{/if}
