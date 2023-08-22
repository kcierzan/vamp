import { writable } from "svelte/store";
import channelStore from "./channel-store";

const latencyStore = writable(0);
const { subscribe, set } = latencyStore;

channelStore.subscribe((value) => {
  sharedChannel = value.shared;
  privateChannel = value.private;
});

function clearLatency() {
  sharedChannel.push("clear_latency");
}

function getLatency() {
  sharedChannel.push("get_latency").receive("ok", (response) => set(response));
}

function measureLatency(count = 20) {
  if (count <= 0) {
    getLatency();
    return;
  }
  sharedChannel
    .push("ping", { client_time: Date.now() })
    .receive("ok", ({ up, server_time }) => {
      const down = Date.now() - server_time;
      sharedChannel.push("report_latency", {
        latency: (up + down) / 2,
      });
    });
  setTimeout(() => measureLatency(count - 1), 100);
}

export default {
  subscribe,
  // getLatency,
  clearLatency,
  measureLatency,
};
