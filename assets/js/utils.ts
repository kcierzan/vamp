import { Socket } from "phoenix";

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

export function joinChannel({
  path,
  topic,
  token,
}: {
  path: string;
  topic: string;
  token: Token;
}) {
  const socket = new Socket(path, {
    params: { token: token },
  });
  socket.connect();
  const channel = socket.channel(topic, {});
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

export function clipsToClipInfos(clips: Clip[]) {
  return clips.map((clip) => {
    const { grainPlayer, ...clipInfo } = clip;
    return clipInfo;
  });
}

async function fileToByteArray(file: File) {
  return new Uint8Array(await fileToArrayBuffer(file));
}

function fileToArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(<ArrayBuffer>reader.result)
    reader.onerror = error => reject(error)
  });
}
