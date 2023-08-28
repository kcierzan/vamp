import { get } from "svelte/store";
import channels from "js/stores/channels";
import { ChannelName, TrackStore } from "./stores/types";
import { Time, Transport } from "tone";
import * as Tone from "tone";

export async function fileToB64(file: File) {
  const bytes = await fileToByteArray(file);
  const len = bytes.byteLength;
  let binary = "";

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function b64ToAudioSrc(b64: string, type: string) {
  const arr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([arr], { type: type });
  return URL.createObjectURL(blob);
}

export function tracksToClipArrays(tracks: TrackStore) {
  const clipArrays = [];
  for (const track of Object.values(tracks)) {
    const trackArray = [];
    for (const clip of Object.values(track.clips)) {
      trackArray.push(clip);
    }
    clipArrays.push(trackArray);
  }
  return clipArrays;
}

export function pushPrivate(message: string, data: object) {
  return get(channels)[ChannelName.Private]?.push(message, data);
}

export function pushShared(message: string, data: object) {
  return get(channels)[ChannelName.Shared]?.push(message, data);
}

export function addChannelListener(
  channelName: ChannelName,
  message: string,
  callback: (response?: any) => void,
) {
  get(channels)[channelName]?.on(message, callback);
}

export function once(cb: (time: number) => void, { at }: { at: number }) {
  Transport.scheduleOnce((time: number) => {
    cb(time);
  }, at);
}

export function quantizedTransportTime(quantizedTime: string) {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - Transport.seconds;
  console.log(`drift: ${drift}`);
  return nextBarAC - drift;
}

async function fileToByteArray(file: File) {
  return new Uint8Array(await fileToArrayBuffer(file));
}

function fileToArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(<ArrayBuffer>reader.result);
    reader.onerror = (error) => reject(error);
  });
}
