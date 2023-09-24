<script>
  import quantizationStore from "js/stores/quantization";
  import { QuantizationInterval } from "js/types";

  const options = {
    [QuantizationInterval.EightBars]: "8 Bars",
    [QuantizationInterval.FourBars]: "4 Bars",
    [QuantizationInterval.TwoBars]: "2 Bars",
    [QuantizationInterval.OneBar]: "1 Bar",
    [QuantizationInterval.HalfNote]: "1/2",
    [QuantizationInterval.QuarterNote]: "1/4",
    [QuantizationInterval.EigthNote]: "1/8",
    [QuantizationInterval.SixteenthNote]: "1/16",
  };
</script>

<select class="h-16" bind:value={$quantizationStore}>
  {#each Object.entries(options) as [value, label] (value)}
    <option {value}>{label}</option>
  {/each}
</select>
