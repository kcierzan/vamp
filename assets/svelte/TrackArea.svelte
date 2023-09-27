<script lang="ts">
  import TrackComponent from "./Track.svelte";
  import NewTrackDndZone from "./NewTrackDndZone.svelte";
  import trackDataStore from "js/stores/track-data";

  export let songId: string;
</script>

<div class="flex h-4/6 w-2/3 flex-row-reverse overflow-scroll">
  <NewTrackDndZone {songId} />
  <div class="flex flex-row">
    {#each $trackDataStore as track (track.id)}
      <TrackComponent {track} />
    {/each}
  </div>
</div>
