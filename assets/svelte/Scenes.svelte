<script>
  import tracks from "../js/stores/tracks";
  import SceneButton from "./SceneButton.svelte";

  export let sessionEmpty

  $: sceneCount = sceneCountFromTracks($tracks);
  $: scenes = scenesFromTracks($tracks);

  function sceneCountFromTracks(tracks) {
    if (sessionEmpty) return 0;
    const clips = Object.values(tracks).map(
      (track) => Object.keys(track.clips).length
    );
    return Math.max(...clips);
  }

  function tracksToClipArrays(tracks) {
    return Object.entries(tracks).reduce((acc, [_, track]) => {
      const c = Object.entries(track.clips).reduce(
        (acc, [_, clip]) => [...acc, clip],
        []
      );
      return [...acc, c];
    }, []);
  }

  function scenesFromTracks(tracks) {
    let scenes = [];
    for (let row = sceneCount - 1; row >= 0; row--) {
      const scene = tracksToClipArrays(tracks).reduce((acc, track) => {
        return !!track[row]
          ? { ...acc, [track[row].trackId]: track[row].id }
          : acc;
      }, {});
      scenes.unshift(scene);
    }
    return scenes;
  }
</script>

{#if sceneCount}
  <div class="flex flex-col items-center">
    {#each scenes as clips, i}
      <SceneButton {clips} index={i} />
    {/each}
  </div>
{/if}
