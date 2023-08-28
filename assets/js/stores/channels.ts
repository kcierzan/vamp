import { Channel, Socket } from "phoenix";
import { ChannelName, PlayableClip, ClipData, NewClip, Token, TrackID, User } from "js/types";
import { receivePlayClips } from "js/stores/clips/play";
import { receiveStopClip } from "js/stores/clips/stop";
import { receiveNewTrack } from "./tracks/new";
import { receiveRemoveTrack } from "./tracks/remove";
import { receiveNewClip } from "./clips/new";
import { receiveUpdateClipProperties } from "./clips/update";

const socketPath = "/socket";
const livesetTopic = "liveset:shared";

export let sharedChannel: Channel | undefined;
export let privateChannel: Channel | undefined;

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
      clips: ClipData[];
      waitMilliseconds: number;
    }) => receivePlayClips({ clips, waitMilliseconds }),
    stop_clip: ({ trackIds }: { trackIds: TrackID[] }) =>
      receiveStopClip({ trackIds }),
  },
  shared: {
    new_track: ({ id }: { id: TrackID }) => receiveNewTrack({ id }),
    remove_track: ({ id }: { id: TrackID }) =>
      receiveRemoveTrack({ trackId: id }),
    new_clip: (newClip: NewClip) => receiveNewClip(newClip),
    update_clip_properties: ({ clips }: { clips: PlayableClip[] }) =>
      receiveUpdateClipProperties({ clips }),
  },
};

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

export function joinPrivateChannel(token: Token, currentUser: User) {
  const livesetPrivateTopic = `private:${currentUser.id}`;
  privateChannel = joinChannel(socketPath, livesetPrivateTopic, token);

  for (const [message, callback] of Object.entries(
    listeners[ChannelName.Private],
  )) {
    privateChannel.on(message, callback);
  }
}

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
