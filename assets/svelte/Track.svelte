<script>
  import { onMount } from "svelte";
  import { fileToB64 } from "js/utils";
  import Clip from "./Clip.svelte";

  export let channel;
  let clips = [];
  const trackID = crypto.randomUUID();

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
    channel && channel.on("new_clip", updateClips);
  });
</script>

<div class="flex flex-col items-center justify-center">
  {#each clips as clip (clip.id)}
    <Clip {clip} {channel} />
  {/each}
  <input
    id="addclip-{trackID}"
    type="file"
    on:change={addClip}
    class="hidden"
  />
  <div
    class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
  >
    <label
      for="addclip-{trackID}"
      class="inline-block py-5 min-h-full min-w-full">Add clip</label
    >
  </div>
</div>
