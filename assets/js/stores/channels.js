import { writable } from "svelte/store";
import { joinChannel } from "../utils";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";

const initialState = {
  shared: null,
  private: null,
};

const channelStore = writable(initialState);
const { update } = channelStore;

function joinPrivateChannel(token, currentUser) {
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

function joinSharedChannel(token) {
  update((store) => {
    store.shared = joinChannel({
      path: socketPath,
      topic: livesetTopic,
      token: token,
    });
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
