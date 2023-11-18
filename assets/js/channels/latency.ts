import { Channel } from "phoenix";
import { Token, Listener, ChannelPrefix, LatencyMessage } from "js/types";
import { joinChannel, setChannelListeners } from "js/channel";

let channel: Channel | undefined;
const listeners: Listener[] = [];

function join(songId: string, token: Token) {
  channel = joinChannel(songId, `${ChannelPrefix.Latency}${songId}`, token);
  setChannelListeners(channel, listeners);
}

function push(message: LatencyMessage, data: object) {
  return channel?.push(message, data);
}

function registerListener(
  message: LatencyMessage,
  callback: (response?: any) => void,
) {
  listeners.push([message, callback]);
}

export default {
  join,
  push,
  registerListener,
};
