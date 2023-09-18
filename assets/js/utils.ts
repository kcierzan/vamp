import { Clip, QuantizationInterval, TrackStore } from "js/types";
import { Time, Transport } from "tone";
import * as Tone from "tone";

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
  return Object.values(tracks).map((track) => Object.values(track.clips));
}

export function quantizedTransportTime(
  quantizedTime: QuantizationInterval,
): number | string {
  if (quantizedTime === QuantizationInterval.None) {
    return quantizedTime;
  }
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

export function debounce(func: (...args: any[]) => any, timeout: number = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: []) => {
    clearTimeout(timer);
    timer = setTimeout(function (this: any) {
      func.apply(this, args);
    }, timeout);
  };
}
