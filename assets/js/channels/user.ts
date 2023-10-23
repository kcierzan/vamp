import { Channel } from "phoenix";
import {
  Token,
  Listener,
  ChannelPrefix,
  User,
  SongPlaybackMessage,
} from "js/types";
import { joinChannel, setChannelListeners } from "js/channels";

let channel: Channel | undefined;
const listeners: Listener[] = [];

function join(user: User, songId: string, token: Token) {
  channel = joinChannel(songId, `${ChannelPrefix.User}${songId}:${user.id}`, token);
  setChannelListeners(channel, listeners);
}

function registerListener(
  message: SongPlaybackMessage,
  callback: (response?: any) => void,
) {
  listeners.push([message, callback]);
}

export default {
  join,
  registerListener,
};
