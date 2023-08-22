import { writable } from "svelte/store";
import { joinChannel } from "./utils";

const socketPath = "/socket";
const liveSetSharedChannel = "liveset:shared";

const initialState = {
  shared: null,
  private: null,
};

const channelStore = writable(initialState)
const { subscribe, update } = channelStore;

function joinPrivateChannel(currentUser) {
  const liveSetPrivateChannel = `private:${currentUser.id}`;
  update((store) => {
    store.private = joinChannel(socketPath, liveSetPrivateChannel);
    return store;
  });
}

function joinSharedChannel() {
  update((store) => {
    store.shared = joinChannel(socketPath, liveSetSharedChannel);
    return store;
  });
}

function attachListener({ channel, message, callback }) {
  update((store) => {
    store[channel].on(message, callback);
    return store;
  });
}

export default {
  ...channelStore,
  set: undefined,
  update: undefined,
  joinPrivateChannel,
  joinSharedChannel,
  attachListener,
};
