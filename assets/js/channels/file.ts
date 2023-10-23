import { Channel } from "phoenix";
import { Token, ChannelPrefix } from "js/types";
import { joinChannel } from "js/channels";

let channel: Channel | undefined;

function join(songId: string, token: Token) {
  channel = joinChannel(songId, `${ChannelPrefix.Files}${songId}`, token);
}

function push(
  audioFileAttrs: {
    clip_id?: string;
    media_type: string;
    size: number;
    name: string;
    bpm: number;
    description?: string;
    song_id: string;
  },
  data: ArrayBuffer,
) {
  return channel?.push(JSON.stringify(audioFileAttrs), data);
}


export default {
  join,
  push,
};
