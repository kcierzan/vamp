import { pushFile } from "./channels";
import { AudioFile } from "./types";
import { fileToArrayBuffer, guessBPM } from "./utils";
import poolStore from "js/stores/pool";

async function pushCreatePoolItem(file: File, songId: string) {
  const { bpm } = await guessBPM(file);
  const buffer = await fileToArrayBuffer(file);
  pushFile(
    {
      name: file.name,
      song_id: songId,
      media_type: file.type,
      size: buffer.byteLength,
      bpm,
    },
    buffer,
  );
}

function receiveCreatePoolItem(audioFile: AudioFile) {
  poolStore.createNewPoolFile(audioFile);
}

export function isAudioFile(item: any): item is AudioFile {
  if (!!!item) return false;
  return (
    "id" in item && "file" in item && "bpm" in item && !item.isDndShadowItem
  );
}

export default {
  push: {
    createPoolItem: pushCreatePoolItem,
  },
  receive: {
    createPoolItem: receiveCreatePoolItem,
  },
};
