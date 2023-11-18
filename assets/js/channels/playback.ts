import { Channel } from "phoenix";
import { Token, ChannelPrefix, SongPlaybackMessage } from "js/types";
import { joinChannel } from "js/channel";

let channel: Channel | undefined;

function join(songId: string, token: Token) {
  channel = joinChannel(songId, `${ChannelPrefix.Playback}${songId}`, token);
}

function push(message: SongPlaybackMessage, data: object) {
  return channel?.push(message, data);
}

export default {
  join,
  push,
};
