import { AudioFile, Clip, QuantizationInterval } from "js/types";
import { Draw, Time, Transport } from "tone";
import * as Tone from "tone";
import { guess } from "web-audio-beat-detector";
import type { Time as TimeType } from "tone/build/esm/core/type/Units";

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

export function transportNow() {
  const drift = Tone.now() - Transport.seconds;
  return Tone.now() - drift;
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

export async function guessBPM(
  file: File,
): Promise<{ bpm: number; offset: number }> {
  const arrayBuf = await fileToArrayBuffer(file);
  const audioBuf = await Tone.getContext().decodeAudioData(arrayBuf);

  try {
    return await guess(audioBuf);
  } catch {
    // FIXME: this effectively skips stretching if bpm guess fails
    return { bpm: Transport.bpm.value, offset: 0 };
  }
}

export function flash(element: HTMLElement) {
  requestAnimationFrame(() => {
    element.style.transition = "none";
    element.style.color = "rgba(255,62,0,1)";
    element.style.backgroundColor = "rgba(255,62,0,0.2)";

    setTimeout(() => {
      element.style.transition = "color 1s, background 1s";
      element.style.color = "";
      element.style.backgroundColor = "";
    });
  });
}

export function round(num: number, place: number) {
  return Math.round((num + Number.EPSILON) * place) / place;
}

export function isAudioFile(item: any): item is AudioFile {
  if (!!!item) return false;
  return (
    "id" in item && "file" in item && "bpm" in item && !item.isDndShadowItem
  );
}

export function isClip(obj: any): obj is Clip {
  if (!!!obj) return false;
  return (
    "id" in obj &&
    "track_id" in obj &&
    "audio_file" in obj &&
    !obj.isDndShadowItem
  );
}

export function transportAtOrNow(at: TimeType) {
  return Transport.seconds > (at as number) ? transportNow() : at;
}
