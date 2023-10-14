import { pushMessage } from "js/channels";
import { SharedMessage } from "js/types";
import latencyStore from "js/stores/latency";

function clearLatency(): void {
  pushMessage(SharedMessage.ClearLatency, {});
}

function getLatency(): void {
  pushMessage(SharedMessage.GetLatency, {})?.receive("ok", (response) =>
    latencyStore.set(response),
  );
}

function measureLatency(count = 20): void {
  if (count <= 0) {
    getLatency();
    return;
  }
  pushMessage(SharedMessage.Ping, { client_time: Date.now() })?.receive(
    "ok",
    ({ up, server_time }) => {
      const down = Date.now() - server_time;
      pushMessage(SharedMessage.ReportLatency, {
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
