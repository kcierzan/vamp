import { AudioFile } from "./types";

export function isAudioFile(item: any): item is AudioFile {
  if (!!!item) return false;
  return "id" in item && "file" in item && "bpm" in item && !item.isDndShadowItem;
}
