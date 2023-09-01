import { TrackStore } from "js/types";
import { Time, Transport } from "tone";
import * as Tone from "tone";
import Clip from "./clip";

export async function fileToB64(file: File): Promise<string> {
  const bytes = await fileToByteArray(file);
  const len = bytes.byteLength;
  let binary = "";

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function b64ToAudioSrc(b64: string, type: string): string {
  const arr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([arr], { type: type });
  return URL.createObjectURL(blob);
}

export function tracksToClipArrays(tracks: TrackStore): Clip[][] {
  const clipArrays: Clip[][] = [];
  for (const track of Object.values(tracks)) {
    const trackArray: Clip[] = [];
    for (const clip of Object.values(track.clips)) {
      trackArray.push(clip);
    }
    clipArrays.push(trackArray);
  }
  return clipArrays;
}

export function quantizedTransportTime(quantizedTime: string): number {
  const nextBarAC = Time(quantizedTime).toSeconds();
  const drift = Tone.now() - Transport.seconds;
  return nextBarAC - drift;
}

export async function fileToByteArray(file: File): Promise<Uint8Array> {
  return new Uint8Array(await fileToArrayBuffer(file));
}

export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(<ArrayBuffer>reader.result);
    reader.onerror = (error) => reject(error);
  });
}
