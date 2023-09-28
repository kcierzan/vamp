<script lang="ts">
  import TrackComponent from "./Track.svelte";
  import NewTrackDndZone from "./NewTrackDndZone.svelte";
  import trackDataStore from "js/stores/track-data";

  export let songId: string;
</script>

<div
  class="flex w-3/4 flex-row-reverse p-2 overflow-scroll border-2 border-slate-200"
>
  <NewTrackDndZone {songId} />
  <div class="flex flex-row">
    {#each $trackDataStore as track (track.id)}
      <TrackComponent {track} />
    {/each}
  </div>
</div>
