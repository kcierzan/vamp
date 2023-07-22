<script>
  import { fade } from "svelte/transition";
  import Button from "./Button.svelte";

  export let number = 5;
  export let pushEvent;

  $: over_5 = number >= 5;

  function increase() {
    pushEvent("set_number", { number: number + 1 });
  }

  function decrease() {
    pushEvent("set_number", { number: number - 1 });
  }

  function reset() {
    pushEvent("set_number", { number: 0 });
  }
</script>

<div class="flex flex-col justify-center items-center rounded max-w-md p-8">
  <span class="text-4xl font-semibold">The current number is:</span>
  <div class="text-8xl font-black mt-12 mb-6" class:text-red-500={over_5}>
    {number}
  </div>

  <div>
    {#if over_5}
      <div class="h-8 min-h-8 font-semibold text-lg text-red-500" in:fade>
        The number is over five!
      </div>
    {:else}
      <div class="h-8 min-h-8" />
    {/if}
  </div>

  <div class="flex grow flex-col items-center">
    <div class="flex-1 mb-2">
      <Button onClick={increase} disabled={over_5}>+</Button>
      <Button onClick={decrease}>-</Button>
    </div>
    <button
      on:click={reset}
      class="min-w-full p-2 text-lg text-white rounded bg-red-500 font-bold hover:bg-red-700"
    >
      RESET
    </button>
  </div>
</div>
