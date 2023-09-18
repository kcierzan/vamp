import { Channel, Socket } from "phoenix";
import type { Clip, Token, TrackID, User } from "js/types";
import { ChannelName, PrivateMessages, SharedMessages } from "js/types";
import transport from "js/stores/transport";
import { receivePlayClips } from "js/stores/clips/play";
import { receiveStopTrack } from "js/stores/tracks/stop";
import { receiveNewTrack } from "js/stores/tracks/new";
import { receiveRemoveTrack } from "js/stores/tracks/remove";
import { receiveNewClip } from "js/stores/clips/new";
import { receiveUpdateClipProperties } from "js/stores/clips/update";
import { Wildcard } from "phx-wildcard";

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
      clips: Clip[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
    stop_track: ({ trackIds }: { trackIds: TrackID[] }) =>
      receiveStopTrack({ trackIds }),
    start_transport: ({ waitMilliseconds }: { waitMilliseconds: number }) =>
      transport.receiveStartTransport({ waitMilliseconds }),
    stop_transport: ({ waitMilliseconds }: { waitMilliseconds: number }) =>
      transport.receiveStopTransport({ waitMilliseconds }),
  },
  shared: {
    new_track: ({ id }: { id: TrackID }) => receiveNewTrack({ id }),
    remove_track: ({ id }: { id: TrackID }) =>
      receiveRemoveTrack({ trackId: id }),
    new_clip: (clip: Clip) => receiveNewClip(clip),
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
