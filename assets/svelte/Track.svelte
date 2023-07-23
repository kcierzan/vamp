<script>
  import { onMount } from "svelte";
  import { Socket } from "phoenix";
  import { fileToB64 } from "js/utils";
  import Clip from "./Clip.svelte";

  let uploadedFiles = [];

  const socket = new Socket("/socket", { params: { token: window.userToken } });
  socket.connect();

  const channel = socket.channel("room:session", {});

  async function handleFileChange() {
    const file = this.files[0];
    // FIXME: sending binary socket messages should be faster
    //        but i'm not sure how to pass along metadata
    const data = await fileToB64(file);
    channel.push("new_clip", {
      id: crypto.randomUUID(),
      name: file.name,
      data: data,
      type: file.type,
    });
  }

  onMount(async () => {
    channel
      .join()
      .receive("ok", (resp) => {
        console.log("Joined successfully", resp);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
      });

    channel.on("new_clip", (clip) => {
      const index = uploadedFiles.findIndex(({ id }) => id === clip.id);
      if (index >= 0) {
        uploadedFiles[index] = clip;
      } else {
        uploadedFiles = [...uploadedFiles, clip];
      }
    });
  });
</script>

<div class="flex flex-col items-center justify-center">
  {#each uploadedFiles as audioFile (audioFile.id)}
    <Clip {audioFile} {channel} />
  {/each}
  <input id="addclip" type="file" on:change={handleFileChange} class="hidden" />
  <div class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700">
    <label for="addclip" class="inline-block py-5 min-h-full min-w-full"
      >Add clip</label
    >
  </div>
</div>
<!-- just push new file events  -->
