<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import project from "js/stores/project";
  import Track from "./Track.svelte";
  import { newTrack } from "js/stores/tracks/new";
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
        currentlyPlaying: null,
        playEvent: null,
        clips: {
          temp: {
            id: "temp",
            name: draggedElem.filename,
            trackId: "temp",
            playbackRate: 1.0,
            state: PlayState.Stopped,
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
    newTrack(trackAttrs);
  }
</script>

<div
  use:dndzone={{ items: Object.values($project), flipDurationMs: 300 }}
  on:consider={considerNewTrack}
  on:finalize={finalizeNewTrack}
  class="w-2/3 border-orange-500 border-2"
>
  {#each Object.values($project) as track (track.id)}
    <Track {track} />
  {/each}
</div>
