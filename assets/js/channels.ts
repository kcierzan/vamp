import { Channel, Socket } from "phoenix";
import type { ClipData, Token, TrackID, User, ClipID } from "js/types";
import { ChannelName, PrivateMessages, SharedMessages } from "js/types"
import { receivePlayClips } from "js/stores/clips/play";
import { receiveStopClip } from "js/stores/clips/stop";
import { receiveNewTrack } from "js/stores/tracks/new";
import { receiveRemoveTrack } from "js/stores/tracks/remove";
import { receiveNewClip, receiveNewBinaryClip } from "js/stores/clips/new";
import { receiveUpdateClipProperties } from "js/stores/clips/update";
import { Wildcard } from "phx-wildcard";
import Clip from "./clip";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";
const fileTopic = "files:clip";

export let sharedChannel: Channel | undefined;
export let privateChannel: Channel | undefined;
export let fileChannel: Channel | undefined;
export let fileWildcardChannel: Wildcard | undefined;

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
      clips: ClipData[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
    stop_clip: ({
      trackIds,
      immediate,
    }: {
      trackIds: TrackID[];
      immediate: boolean;
    }) => receiveStopClip({ trackIds, immediate }),
  },
  shared: {
    new_track: ({ id }: { id: TrackID }) => receiveNewTrack({ id }),
    remove_track: ({ id }: { id: TrackID }) =>
      receiveRemoveTrack({ trackId: id }),
    new_clip: (clipData: ClipData) => receiveNewClip(clipData),
    update_clip_properties: ({ clips }: { clips: Clip[] }) =>
      receiveUpdateClipProperties({ clips }),
  },
};

export function joinSharedChannel(token: Token) {
  sharedChannel = joinChannel(socketPath, livesetTopic, token);

  for (const [message, callback] of Object.entries(
    listeners[ChannelName.Shared],
  )) {
    sharedChannel.on(message, callback);
  }
}

export function pushPrivate(message: string, data: object) {
  return privateChannel?.push(message, data);
}

export function pushShared(message: string, data: object) {
  return sharedChannel?.push(message, data);
}

export function pushFile(clipId: ClipID, trackId: TrackID, data: ArrayBuffer) {
  return fileChannel?.push(`${trackId}:${clipId}`, data);
}

export function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  privateChannel = joinChannel(socketPath, livesetPrivateTopic, token);

  for (const [message, callback] of Object.entries(
    listeners[ChannelName.Private],
  )) {
    privateChannel.on(message, callback);
  }
}

export function joinFileChannel(token: Token) {
  const channel = joinChannel(socketPath, fileTopic, token);
  fileChannel = channel;
  const wildcard = new Wildcard(channel);
  fileWildcardChannel = wildcard;
  fileWildcardChannel.on("*:*", receiveNewBinaryClip);
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
