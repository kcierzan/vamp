<script>
  export let onClick;
  export let disabled;
  export let negative = false;
</script>

<button
  {disabled}
  on:click={onClick}
  class="text-4xl w-32 h-16 my-2 text-white rounded "
  class:bg-sky-500={!negative}
  class:hover:bg-sky-700={!negative}
  class:bg-red-500={negative}
  class:hover:bg-red-700={negative}
  class:bg-slate-200={disabled}
  class:hover:bg-slate-200={disabled}
>
  <slot>submit</slot>
</button>
