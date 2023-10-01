<script>
  import Pool from "./Pool.svelte";
  import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
  import audioFileMessage from "js/audio-file";

  export let songId;

  function onDrop(e) {
    const { acceptedFiles } = e.detail;
    audioFileMessage.push.createPoolItem(acceptedFiles[0], songId);
  }
</script>

<div class="flex w-1/4 flex-col justify-between">
  <Pool />
  <Dropzone on:drop={onDrop} accept="audio/*" />
</div>
