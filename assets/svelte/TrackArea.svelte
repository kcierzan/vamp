<script lang="ts">
  import TrackComponent from "./Track.svelte";
  import NewTrackDndZone from "./NewTrackDndZone.svelte";
  import trackDataStore from "js/stores/track-data";
  import ClipProgressIcon from "./ClipProgressIcon.svelte";

  export let songId: string;
</script>

  <div
    class="flex w-3/4 flex-row-reverse overflow-scroll rounded border-2 border-slate-200 p-2"
  >
    <NewTrackDndZone {songId} />
    <div class="flex flex-row">
      {#each $trackDataStore as track (track.id)}
        <div class="flex flex-col">
          <TrackComponent {track} />
          <div class="my-2">
            <ClipProgressIcon trackId={track.id} />
          </div>
        </div>
      {/each}
    </div>
  </div>
