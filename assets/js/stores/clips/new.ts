import { fileToB64, b64ToAudioSrc } from "../../utils";
import { GrainPlayer } from "tone";
import { ClipID, NewClip, PlayState, TrackID } from "js/types";
import PlayableClip from "js/playableClip";
import { Transport } from "tone";
import { pushShared } from "../channels";
import vampsetStore from "../vampset";

export async function newClip(
  file: File,
  trackId: TrackID,
  bpm: number,
  id: ClipID = crypto.randomUUID(),
) {
  const data = await fileToB64(file);
  pushShared("new_clip", {
    id: id,
    name: file.name,
    data: data,
    type: file.type,
    trackId: trackId,
    state: PlayState.Stopped,
    currentTime: 0.0,
    playbackRate: Transport.bpm.value / bpm,
    bpm,
  });
}

export function receiveNewClip(newClip: NewClip) {
  const { trackId, name, bpm, id, state, data, type, playbackRate } = newClip;
  const url = b64ToAudioSrc(data, type);
  const grainPlayer = new GrainPlayer(url).toDestination();
  const playableClip = new PlayableClip(
    trackId,
    name,
    type,
    playbackRate,
    0.0,
    bpm,
    grainPlayer,
    id,
    state,
  );
  vampsetStore.update((store) => {
    store[trackId].clips[id] = playableClip;
    return store;
  });
}
