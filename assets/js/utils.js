async function toByteArray(file) {
  return new Uint8Array(await readFile(file));
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.addEventListener("loadend", (e) => resolve(e.target.result));
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(file);
  });
}

export async function fileToBase64(file) {
  let binary = "";
  let bytes = await toByteArray(file);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToFile(b64, type) {
  const arr = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([arr], { type: type });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return audio;
}
