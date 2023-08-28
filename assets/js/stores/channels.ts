import { Channel, Socket } from "phoenix";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { ChannelName, ChannelStore, ClipInfo, Token, User } from "./types";
import { receivePlayClips } from "js/stores/clips/play";
import { addChannelListener } from "js/utils";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";

const initialState = {
  shared: null,
  private: null,
};

const channelStore: Writable<ChannelStore> = writable(initialState);
const { update } = channelStore;

interface Listeners {
  [ChannelName.Private]: {
    [key: string]: (response?: any) => void;
  };
  [ChannelName.Shared]: {
    [key: string]: (response?: any) => void;
  };
}

const listeners: Listeners = {
  private: {
    play_clip: ({
      clips,
      waitMilliseconds,
    }: {
      clips: ClipInfo[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
  },
  shared: {},
};

function joinChannel(
  path: string,
  topic: string,
  token: string,
  channelName: ChannelName,
) {
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
  update((store) => {
    store[channelName] = channel;
    return store;
  });
}

function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  joinChannel(socketPath, livesetPrivateTopic, token, ChannelName.Private);
  configureChannelCallbacks(ChannelName.Private);
}

function joinSharedChannel(token: Token) {
  joinChannel(socketPath, livesetTopic, token, ChannelName.Shared);
  configureChannelCallbacks(ChannelName.Shared);
  update((store) => {
    console.log(store[ChannelName.Shared])
    return store
  })
}

function configureChannelCallbacks(channelName: ChannelName) {
  for (const [message, callback] of Object.entries(listeners[channelName])) {
    addChannelListener(channelName, message, callback);
  }
}

export default {
  ...channelStore,
  set: undefined,
  update: undefined,
  joinPrivateChannel,
  joinSharedChannel,
};
