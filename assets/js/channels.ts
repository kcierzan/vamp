import { Channel, Socket } from "phoenix";
import type { Token, User } from "js/types";
import { ChannelName, PrivateMessage, SharedMessage } from "js/types";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";
const fileTopic = "files:clip";

const listeners: Listeners = {};
let sharedChannel: Channel | undefined;
let privateChannel: Channel | undefined;
let fileChannel: Channel | undefined;

interface Listeners {
  [ChannelName.Private]?: {
    [key in PrivateMessage]?: (response?: any) => void;
  };
  [ChannelName.Shared]?: {
    [key in SharedMessage]?: (response?: any) => void;
  };
}

export function joinChannels(token: Token, currentUser: User) {
  joinSharedChannel(token);
  joinPrivateChannel(token, currentUser);
  joinFileChannel(token);
}

export function pushMessage(message: SharedMessage, data: object) {
  return sharedChannel?.push(message, data);
}

export function registerChannelListener(
  message: PrivateMessage | SharedMessage,
  cb: (...args: any[]) => any,
) {
  if (Object.values(PrivateMessage).includes(message as PrivateMessage)) {
    listeners.private = {
      ...listeners.private,
      [message as PrivateMessage]: cb,
    };
  } else if (Object.values(SharedMessage).includes(message as SharedMessage)) {
    listeners.shared = {
      ...listeners.shared,
      [message as SharedMessage]: cb,
    };
  }
}

export function pushFile(
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
  return fileChannel?.push(JSON.stringify(audioFileAttrs), data);
}

function joinSharedChannel(token: Token) {
  sharedChannel = joinChannel(socketPath, livesetTopic, token);

  if (!!listeners[ChannelName.Shared]) {
    for (const [message, callback] of Object.entries(
      listeners[ChannelName.Shared],
    )) {
      sharedChannel.on(message, callback);
    }
  }
}

function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  privateChannel = joinChannel(socketPath, livesetPrivateTopic, token);

  if (!!listeners[ChannelName.Private]) {
    for (const [message, callback] of Object.entries(
      listeners[ChannelName.Private],
    )) {
      privateChannel.on(message, callback);
    }
  }
}

function joinFileChannel(token: Token) {
  fileChannel = joinChannel(socketPath, fileTopic, token);
}

function joinChannel(path: string, topic: string, token: string) {
  const socket = new Socket(path, {
    params: { token: token },
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
