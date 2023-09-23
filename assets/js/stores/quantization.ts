import { QuantizationInterval } from "js/types";
import { Writable, writable } from "svelte/store";

const quantization: Writable<QuantizationInterval> = writable(
  QuantizationInterval.OneBar,
);

export default quantization;
