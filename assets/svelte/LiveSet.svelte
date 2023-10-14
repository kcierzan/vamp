<svelte:options immutable />

<script lang="ts">
  import type { Song, Token, User } from "js/types";
  import { onMount } from "svelte";
  import { initialize } from "js/initialization";
  import trackDataStore from "js/stores/track-data";
  import latencyStore from "js/stores/latency";
  import Scenes from "./Scenes.svelte";
  import TrackArea from "./TrackArea.svelte";
  import MediaBay from "./MediaBay.svelte";
  import SongNav from "./SongNav.svelte";
  import Editor from "./Editor.svelte";

  export let currentUser: User;
  export let token: Token;
  export let project: Song;

  // let element: HTMLElement;
  // afterUpdate(() => flash(element));

  const sessionEmpty = project.tracks.length === 0;

  onMount(async () => {
    await initialize(project, currentUser, token);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project.title}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latencyStore} ms!</h3>
</div>

<SongNav {project} />

<div class="flex w-full flex-row items-center justify-center gap-1">
  <div class="flex h-5/6 w-10/12 flex-col justify-between">
    <div class="flex flex-row">
      <Scenes />
      <TrackArea songId={project.id} />
      <MediaBay songId={project.id} />
    </div>
    <Editor />
  </div>
</div>
