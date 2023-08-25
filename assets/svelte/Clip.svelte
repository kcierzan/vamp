<script>
  import tracks from "js/stores/tracks";

  export let id;
  export let name;
  export let trackId;
  export let state = "stopped";
  export let playbackRate = 1;
  export let bpm = 0

  const { addClip, playClip, stopClips, changePlaybackRate } = tracks;

  // TODO: extract this to PlayableButton or something
  const baseStyles = "text-base w-48 h-16 text-white rounded-l-lg";
  const stateStyles = {
    playing: "bg-red-500 hover:bg-red-700",
    stopped: "bg-green-500 hover:bg-green-700",
    queued: "bg-yellow-500 hover:bg-yellow-700",
  };

  $: clipStyles = baseStyles + " " + stateStyles[state];

  function changeClip() {
    addClip({ file: this.files[0], trackId, bpm, clipId: id });
  }

  function changeTempo() {
    changePlaybackRate(id, trackId, this.value);
  }

  function clipAction() {
    switch (state) {
      case "stopped":
        playClip(id, trackId);
        break;
      case "playing":
        stopClips([trackId]);
    }
  }
</script>

<div class="flex flex-row mb-2">
  <input
    id="clipchange-{id}"
    type="file"
    class="hidden"
    on:change={changeClip}
  />
  <button on:click={clipAction} class={clipStyles}>
    {name} - {bpm}BPM
  </button>
  <div
    class="text-center text-base w-24 h-16 align-middle text-white rounded-r-lg bg-sky-500 hover:bg-sky-700"
  >
    <label for="clipchange-{id}" class="inline-block py-5 min-h-full min-w-full"
      >change file</label
    >
  </div>
</div>
<input
  class="mb-2 w-64"
  type="range"
  min="0"
  step="0.01"
  max="2"
  bind:value={playbackRate}
  on:input={changeTempo}
/>
