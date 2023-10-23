import { Channel, Socket } from "phoenix";
import { Listener } from "js/types";

export const SOCKET_PATH = "/socket";

export function joinChannel(songId: string, topic: string, token: string) {
  const socket = new Socket(SOCKET_PATH, {
    params: { token: token, song_id: songId},
  });
  socket.connect();
  const channel: Channel = socket.channel(topic, {});
  channel
    .join()
    .receive("ok", (resp) => {
      console.log("Joined successfully", resp);
    })
    .receive("error", (resp) => {
      console.log("Unable to join", resp);
    });
  return channel;
}

export function setChannelListeners(channel: Channel, listeners: Listener[]) {
  for (const [message, cb] of listeners) {
    channel.on(message, cb);
  }
}
