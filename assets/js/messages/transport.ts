import { pushMessage, registerChannelListener } from "js/channels";
import { PrivateMessage, SharedMessage } from "js/types";
import transportStore from "js/stores/transport";

function start(): void {
  pushMessage(SharedMessage.StartTransport, {});
}

function stop(): void {
  pushMessage(SharedMessage.StopTransport, {});
}

registerChannelListener(
  PrivateMessage.StartTransport,
  function receiveStartTransport({
    waitMilliseconds,
  }: {
    waitMilliseconds: number;
  }) {
    transportStore.startLocal(`+${waitMilliseconds / 1000}`);
  },
);

registerChannelListener(
  PrivateMessage.StopTransport,
  function receiveStopTransport({
    waitMilliseconds,
  }: {
    waitMilliseconds: number;
  }) {
    transportStore.stopOrPauseLocal({ waitMilliseconds });
  },
);

export default {
  start,
  stop,
};
