import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { joinChannel } from "../utils";
import type { ChannelStore, Token, User } from "./types";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";

const initialState = {
  shared: null,
  private: null,
};

const channelStore: Writable<ChannelStore> = writable(initialState);
const { update } = channelStore;

function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  update((store) => {
    store.private = joinChannel({
      path: socketPath,
      topic: livesetPrivateTopic,
      token: token,
    });
    return store;
  });
}

function joinSharedChannel(token: Token) {
  update((store) => {
    store.shared = joinChannel({
      path: socketPath,
      topic: livesetTopic,
      token: token,
    });
    return store;
  });
}

export default {
  ...channelStore,
  set: undefined,
  update: undefined,
  joinPrivateChannel,
  joinSharedChannel,
};
