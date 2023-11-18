import latencyStore from "js/stores/latency";
import latencyChannel from "js/channels/latency";
import { LatencyMessage } from "js/types";

function clearLatency(): void {
  latencyChannel.push(LatencyMessage.ClearLatency, {});
}

function getLatency(): void {
  latencyChannel
    .push(LatencyMessage.GetLatency, {})
    ?.receive("ok", (response: number) => latencyStore.set(response));
}

function measureLatency(count = 20): void {
  if (count <= 0) {
    getLatency();
    return;
  }
  latencyChannel.push(LatencyMessage.Ping, { client_time: Date.now() })?.receive(
    "ok",
    ({ up, server_time }) => {
      const down = Date.now() - server_time;
      latencyChannel.push(LatencyMessage.ReportLatency, {
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
  calculateLatency,
};
