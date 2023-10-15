<script>
  import Pool from "./Pool.svelte";
  import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
  import audioFileMessage from "js/messages/audio-file";

  export let songId;

  function onDrop(e) {
    const { acceptedFiles } = e.detail;
    audioFileMessage.createPoolFile(acceptedFiles[0], songId);
  }
</script>

<div class="flex w-1/4 flex-col justify-between gap-y-2">
  <Pool />
  <Dropzone class="rounded" on:drop={onDrop} accept="audio/*" />
</div>
