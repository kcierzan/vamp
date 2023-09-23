import { AudioFile, DndItem } from "./types";

export function isAudioFile(item: DndItem): item is AudioFile {
  if (!!!item) return false;
  return "id" in item && "file" in item && "bpm" in item;
}