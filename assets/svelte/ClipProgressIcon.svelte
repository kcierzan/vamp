<script lang="ts">
  import trackStore from "js/stores/tracks";
  // import samplerStore from "js/stores/samplers";
  import { TrackID } from "js/types";
  import { Transport } from "tone"

  export let trackId: TrackID;
  let circle: SVGCircleElement;
  let animation: Animation | null = null;

  $: playingClipId = !!trackId && $trackStore[trackId].currentlyPlaying;
  // $: sampler = !!playingClipId && $samplerStore[playingClipId.id].sampler;
  // $: clipDuration = !!sampler && sampler.duration / sampler.speedFactor;

  function oneBarDuration() {
    return 60 / Transport.bpm.value * 4
  }

  $: {
    !!playingClipId ? spin() : stop();
  }

  function spin() {
    animation = circle.animate(
      [
        {
          strokeDasharray: "0 39",
        },
        {
          strokeDasharray: "39",
        },
      ],
      {
        easing: "linear",
        iterations: Infinity,
        direction: "normal",
        // FIXME: this should be the repeat rate of the clip
        // which is not necessarily its buffer length / speedFactor
        duration: (oneBarDuration() || 0) * 1000,
      },
    );
  }

  function stop() {
    !!animation && animation.cancel();
  }
</script>

<svg width="25" height="25" class="chart">
  <circle bind:this={circle} r="6.25" cx="12.5" cy="12.5" class="pie"></circle>
</svg>

<style>
  circle {
    fill: #ddd;
    stroke: #0074d9;
    stroke-width: 12.5;
    stroke-dasharray: 0 39;
  }

  svg {
    margin: 0 auto;
    transform: rotate(-90deg);
    background: #ddd;
    border-radius: 50%;
    display: block;
  }
</style>
