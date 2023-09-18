import { writable } from "svelte/store";
import { pushShared } from "js/channels";

const latencyStore = writable(0);
const { subscribe, set } = latencyStore;

function clearLatency(): void {
  pushShared("clear_latency", {});
}

function getLatency(): void {
  pushShared("get_latency", {})?.receive("ok", (response) => set(response));
}

function measureLatency(count = 20): void {
  if (count <= 0) {
    getLatency();
    return;
  }
  pushShared("ping", { client_time: Date.now() })?.receive(
    "ok",
    ({ up, server_time }) => {
      const down = Date.now() - server_time;
      pushShared("report_latency", {
        latency: (up + down) / 2,
      });
    },
  );
  setTimeout(() => measureLatency(count - 1), 100);
}

function calculateLatency() {
  clearLatency();
  measureLatency();
}

export default {
  subscribe,
  calculateLatency,
};
