import { Socket } from "phoenix";

export async function fileToB64(file) {
  const bytes = await fileToByteArray(file);
  const len = bytes.byteLength;
  let binary = "";

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function b64ToAudioSrc(b64, type) {
  const arr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([arr], { type: type });
  return URL.createObjectURL(blob);
}

export function joinChannel({ path, topic, token }) {
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

async function fileToByteArray(file) {
  return new Uint8Array(await fileToArrayBuffer(file));
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.addEventListener("loadend", (e) => resolve(e.target.result));
    reader.addEventListener("error", reject);
    !!file && reader.readAsArrayBuffer(file);
  });
}
