<script>
  import Clip from "./Clip.svelte";
  import tracks from "js/stores/tracks";

  export let id;
  export let clips = {};
  let clipBpm;

  const { addClip } = tracks;

  function newClip() {
    addClip({ file: this.files[0], trackId: id, bpm: clipBpm });
    this.value = "";
  }
</script>

<div class="flex flex-col items-center justify-center">
  {#each Object.values(clips) as clip (clip?.id)}
    <Clip
      id={clip.id}
      trackId={id}
      name={clip.name}
      state={clip.state}
      playbackRate={clip.playbackRate}
      bpm={clip.bpm}
    />
  {/each}
  <input id="addclip-{id}" type="file" on:change={newClip} class="hidden" />
  <div
    class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
  >
    <label for="addclip-{id}" class="inline-block py-5 min-h-full min-w-full"
      >Add clip</label
    >
  </div>
  <input type="number" bind:value={clipBpm} />
</div>
