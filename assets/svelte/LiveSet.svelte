<svelte:options immutable />

<script lang="ts">
  import type { Song, Token, User } from "js/types";
  import * as Tone from "tone";
  import { onMount } from "svelte";
  import latency from "../js/stores/latency";
  import { joinChannels } from "js/channels";
  import transportStore from "js/stores/transport";
  import poolStore from "js/stores/pool";
  import Scenes from "./Scenes.svelte";
  import TrackArea from "./TrackArea.svelte";
  import MediaBay from "./MediaBay.svelte";
  import { afterUpdate } from "svelte";
  import { flash } from "js/utils";
  import trackDataStore from "js/stores/track-data";
  import playersStore from "js/stores/players";
  import trackPlaybackStore from "js/stores/tracks";
  import clipStore from "js/stores/clips";
  import SongNav from "./SongNav.svelte";

  export let currentUser: User;
  export let token: Token;
  export let project: Song;

  const { calculateLatency } = latency;
  // let element: HTMLElement;
  // afterUpdate(() => flash(element));

  const sessionEmpty = project.tracks.length === 0;

  function setInitialStateFromProps(props: Song) {
    transportStore.setBpm(props.bpm);
    trackDataStore.setFromProps(props.tracks);
    trackPlaybackStore.setFromProps(props.tracks);
    playersStore.setFromProps(props.tracks);
    poolStore.set(props.audio_files);
    clipStore.setFromProps(props.tracks);
  }

  onMount(async () => {
    Tone.getContext().lookAhead = 0.05;

    joinChannels(token, currentUser);
    setInitialStateFromProps(project);
    calculateLatency();
  });
</script>

<div class="flex flex-col items-center">
  <h1 class="bold text-4xl underline">{project.title}</h1>
  <h2 class="text-2xl" class:invisible={!sessionEmpty}>
    Why don't you start by adding some tracks?
  </h2>
  <h3>Your latency is {$latency} ms!</h3>
</div>

<SongNav {project} />

<div class="flex w-full flex-row items-center justify-center gap-1">
  <div class="flex h-5/6 w-10/12 justify-between">
    <Scenes />
    <TrackArea songId={project.id} />
    <MediaBay songId={project.id} />
  </div>
</div>
