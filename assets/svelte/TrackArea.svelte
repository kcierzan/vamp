<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";
  import { PlayState } from "js/types";

  export let songId: string;

  function considerNewTrack(e: any) {
    // TODO: update $project locally so new track "appears"?
    const draggedElem = e.detail.items.find(
      (item: any) => item.id === e.detail.info.id
    );
    project.update((store) => {
      store["temp"] = {
        id: "temp",
        name: "temp",
        currentlyPlaying: null,
        playEvent: null,
        gain: 0,
        panning: 0,
        audio_clips: [],
        clips: {
          temp: {
            id: "temp",
            name: draggedElem.filename,
            type: "temp",
            track_id: "temp",
            playback_rate: 1.0,
            state: PlayState.Stopped,
            audio_file: null,
          },
        },
      };
      return store;
    });
  }

  function finalizeNewTrack(e: any) {
    project.update((store) => {
      delete store["temp"];
      return store;
    });

    const draggedElem = e.detail.items.find(
      (item: any) => item.id === e.detail.info.id
    );
    const trackAttrs = {
      name: "new track",
      song_id: songId,
      gain: 0.0,
      panning: 0.0,
      audio_clips: [
        {
          name: draggedElem.filename,
          type: draggedElem.media_type,
          playback_rate: 1.0,
          audio_file_id: draggedElem.id,
        },
      ],
    };
    // FIXME:
    // newTrackFromPoolItem(track -> audio_clip -> audio_file)
  }
</script>

<div
  use:dndzone={{ items: Object.values($project), flipDurationMs: 300 }}
  on:consider={considerNewTrack}
  on:finalize={finalizeNewTrack}
  class="flex flex-row w-2/3 h-4/6 border-orange-500 border-2 overflow-scroll"
>
  {#each Object.values($project) as track (track.id)}
    <Track {track} />
  {/each}
  <div
    class="flex justify-center items-center border-2 border-orange-500 w-full"
  >
    <div class="flex flex-col items-center w-40 gap-4">
      <svg class="hero-plus-circle bg-slate-300 h-20 w-20" />
      <p class="text-center">Drag some files here to add a new track</p>
    </div>
  </div>
</div>

<style>
  .empty::after {
    content: "\200B";
    visibility: hidden;
  }
</style>
