<script>
  export let onClick;
  export let disabled;
  export let classes = "";
  export let negative = false;
</script>

<button
  {disabled}
  on:click={onClick}
  class="text-base w-48 h-16 text-white rounded-lg {classes}"
  class:bg-green-500={!negative}
  class:hover:bg-green-700={!negative}
  class:bg-red-500={negative}
  class:hover:bg-red-700={negative}
  class:bg-slate-200={disabled}
  class:hover:bg-slate-200={disabled}
>
  <slot>submit</slot>
</button>
