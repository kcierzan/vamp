<svelte:options immutable />

<script lang="ts">
  import type { Song, Token, User } from "js/types";
  import { onMount } from "svelte";
  import { initialize } from "js/initialization";
  import { latencyStore } from "js/stores/index";
  import Scenes from "./Scenes.svelte";
  import TrackArea from "./TrackArea.svelte";
  import MediaBay from "./MediaBay.svelte";
  import SongNav from "./SongNav.svelte";
  import Editor from "./Editor.svelte";

  export let currentUser: User;
  export let token: Token;
  export let song: Song;

  const sessionEmpty = song.tracks.length === 0;

  onMount(async () => {
    await initialize(song, currentUser, token);
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{song.title}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latencyStore} ms!</h3>
</div>

<SongNav project={song} />

<div class="flex w-full flex-row items-center justify-center gap-1">
  <div class="flex h-5/6 w-10/12 flex-col justify-between">
    <div class="flex flex-row gap-x-2">
      <Scenes />
      <TrackArea songId={song.id} />
      <MediaBay songId={song.id} />
    </div>
    <Editor />
  </div>
</div>
