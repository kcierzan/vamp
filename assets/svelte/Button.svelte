<script>
  export let onClick;
  export let disabled;
</script>

<button
  {disabled}
  on:click={onClick}
  class="text-4xl py-3 px-10 text-white rounded mr-1 bg-sky-500 font-bold hover:bg-sky-700"
  class:bg-slate-200={disabled}
  class:hover:bg-slate-200={disabled}
>
  <slot>submit</slot>
</button>
