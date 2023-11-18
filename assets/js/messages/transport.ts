import { transportStore } from "js/stores";
import { playbackChannel, userChannel } from "js/channels";
import { SongPlaybackMessage } from "js/types";

function start(): void {
  playbackChannel.push(SongPlaybackMessage.StartTransport, {});
}

function stop(): void {
  playbackChannel.push(SongPlaybackMessage.StopTransport, {});
}

userChannel.registerListener(
  SongPlaybackMessage.StartTransport,
  function receiveStartTransport({
    waitMilliseconds,
  }: {
    waitMilliseconds: number;
  }) {
    transportStore.startLocal(`+${waitMilliseconds / 1000}`);
  },
);

userChannel.registerListener(
  SongPlaybackMessage.StopTransport,
  function receiveStopTransport({
    waitMilliseconds,
  }: {
    waitMilliseconds: number;
  }) {
    // TODO: hoist the "stop or pause" conditional here and cancel all playback events on `stop`
    transportStore.stopOrPauseLocal({ waitMilliseconds });
  },
);

export default {
  start,
  stop,
};
