<script lang="ts">
  import { Clip, PlayState, TrackData, TrackID } from "js/types";
  import { trackDataStore } from "js/stores";
  import { playback } from "js/messages";
  import { start } from "tone";

  export let index: string;
  export let clips: Clip[];
  export let state: PlayState;

  async function playScene(): Promise<void> {
    await start();
    const allTrackIds = $trackDataStore.map((track: TrackData) => track.id);
    const tracksInScene = clips.map((clip: Clip) => clip.track_id);
    const tracksToStop = allTrackIds.filter(
      (trackId: TrackID) => !tracksInScene.includes(trackId),
    );
    playback.playClips(...clips);
    playback.stopTracks(...tracksToStop);
  }

  function stopScene(): void {
    const tracksInScene = clips.map((clip: Clip) => clip.track_id);
    playback.stopTracks(...tracksInScene);
  }

  function sceneAction() {
    switch (state) {
      case PlayState.Stopped:
        playScene();
        break;
      case PlayState.Playing:
        stopScene();
    }
  }

  // TODO: extract this to PlayableButton or something
  const baseStyles = "w-20 h-8 text-white rounded";
  const stateStyles = {
    [PlayState.Playing]: "bg-red-500 hover:bg-red-700",
    [PlayState.Stopped]: "bg-green-500 hover:bg-green-700",
    [PlayState.Queued]: "bg-yellow-500 hover:bg-yellow-700 text-black",
    [PlayState.Paused]: "",
  };

  $: sceneStyles = baseStyles + " " + stateStyles[state];
</script>

<div>
  <button class={sceneStyles} on:click={sceneAction}
    >Scene {parseInt(index) + 1}</button
  >
</div>
