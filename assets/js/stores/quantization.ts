import { QuantizationInterval } from "js/types";
import { Writable, writable } from "svelte/store";

const quantizationStore: Writable<QuantizationInterval> = writable(
  QuantizationInterval.OneBar,
);

export default quantizationStore;
