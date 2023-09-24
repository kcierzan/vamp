import { Channel, Socket } from "phoenix";
import type { Clip, Token, TrackData, TrackID, User } from "js/types";
import { ChannelName, PrivateMessages, SharedMessages } from "js/types";
import transportStore from "js/stores/transport";
import { receivePlayClips, receiveNewClip, receiveUpdateClips } from "js/clip";
import {
  receiveStopTrack,
  receiveRemoveTrack,
  receiveNewTrack,
} from "js/track";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";
const fileTopic = "files:clip";

let sharedChannel: Channel | undefined;
let privateChannel: Channel | undefined;
let fileChannel: Channel | undefined;

interface Listeners {
  [ChannelName.Private]: {
    [key in PrivateMessages]: (response?: any) => void;
  };
  [ChannelName.Shared]: {
    [key in SharedMessages]: (response?: any) => void;
  };
}

const listeners: Listeners = {
  private: {
    play_clip: ({
      clips,
      waitMilliseconds,
    }: {
      clips: Clip[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
    stop_track: ({ trackIds }: { trackIds: TrackID[] }) =>
      receiveStopTrack({ trackIds }),
    start_transport: ({ waitMilliseconds }: { waitMilliseconds: number }) =>
      transportStore.receiveStartTransport({ waitMilliseconds }),
    stop_transport: ({ waitMilliseconds }: { waitMilliseconds: number }) =>
      transportStore.receiveStopTransport({ waitMilliseconds }),
  },
  shared: {
    new_track: (track: TrackData) => receiveNewTrack(track),
    remove_track: ({ id }: { id: TrackID }) => receiveRemoveTrack(id),
    new_clip: (clip: Clip) => receiveNewClip(clip),
    update_clips: ({ clips }: { clips: Clip[] }) =>
      receiveUpdateClips(...clips),
  },
};

export function joinChannels(token: Token, currentUser: User) {
  joinSharedChannel(token);
  joinPrivateChannel(token, currentUser);
  joinFileChannel(token);
}

export function pushPrivate(message: string, data: object) {
  return privateChannel?.push(message, data);
}

export function pushShared(message: string, data: object) {
  return sharedChannel?.push(message, data);
}

export function pushFile(
  audioFileAttrs: {
    clip_id: string;
    media_type: string;
    size: number;
    name: string;
    description: string;
  },
  data: ArrayBuffer,
) {
  return fileChannel?.push(JSON.stringify(audioFileAttrs), data);
}

function joinSharedChannel(token: Token) {
  sharedChannel = joinChannel(socketPath, livesetTopic, token);

  for (const [message, callback] of Object.entries(
    listeners[ChannelName.Shared],
  )) {
    sharedChannel.on(message, callback);
  }
}

function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  privateChannel = joinChannel(socketPath, livesetPrivateTopic, token);

  for (const [message, callback] of Object.entries(
    listeners[ChannelName.Private],
  )) {
    privateChannel.on(message, callback);
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
