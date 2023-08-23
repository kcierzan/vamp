<script>
  import tracks from "../js/stores/tracks";

  export let clips;
  export let index;
  const { playClips } = tracks;
</script>

<div>
  <button
    class="rounded class bg-yellow-500 hover:bg-yellow-700 text-black w-24 h-16 mb-8"
    on:click={() => playClips(clips)}>Scene {index + 1}</button
  >
</div>
