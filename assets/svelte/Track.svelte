<script>
  import { onMount } from "svelte";
  import { Socket } from "phoenix";
  import { fileToB64 } from "js/utils";
  import Clip from "./Clip.svelte";

  let clips = [];

  const socket = new Socket("/socket", { params: { token: window.userToken } });
  socket.connect();

  const channel = socket.channel("room:session", {});

  async function addClip() {
    const file = this.files[0];
     // FIXME: sending binary socket messages should be faster
     //        but i'm not sure how to pass along metadata. Maybe
     //        we can send two messages?
    const data = await fileToB64(file);
    channel.push("new_clip", {
      id: crypto.randomUUID(),
      name: file.name,
      data: data,
      type: file.type,
    });
  }

  function updateClips(new_clip) {
    const index = clips.findIndex(({ id }) => id === new_clip.id);
    if (index >= 0) {
      clips[index] = new_clip;
    } else {
      clips = [...clips, new_clip];
    }
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

    channel.on("new_clip", updateClips);
  });
</script>

<div class="flex flex-col items-center justify-center">
  {#each clips as clip (clip.id)}
    <Clip {clip} {channel} />
  {/each}
  <input id="addclip" type="file" on:change={addClip} class="hidden" />
  <div
    class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
  >
    <label for="addclip" class="inline-block py-5 min-h-full min-w-full"
      >Add clip</label
    >
  </div>
</div>
<!-- just push new file events  -->
