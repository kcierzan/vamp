<script>
  import { onMount } from "svelte";
  import { fileToB64 } from "js/utils";
  import Clip from "./Clip.svelte";

  export let channel;
  export let currentTrackId;
  let clips = {};

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
      trackId: currentTrackId,
    });
  }

  function updateClips(new_clip) {
    if (new_clip.trackId !== currentTrackId) return;
    const { id } = new_clip
    clips[id] = new_clip;
  }

  onMount(async () => {
    channel && channel.on("new_clip", updateClips);
  });
</script>

<div class="flex flex-col items-center justify-center">
  {#each Object.values(clips) as clip (clip.id)}
    <Clip {clip} {channel} {currentTrackId} />
  {/each}
  <input
    id="addclip-{currentTrackId}"
    type="file"
    on:change={addClip}
    class="hidden"
  />
  <div
    class="text-center text-base w-72 h-16 align-middle text-white rounded bg-sky-500 hover:bg-sky-700"
  >
    <label
      for="addclip-{currentTrackId}"
      class="inline-block py-5 min-h-full min-w-full">Add clip</label
    >
  </div>
</div>
