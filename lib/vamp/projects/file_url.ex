defmodule Vamp.Projects.FileUrl do
  def add_url_to_audio_clip(audio_clip) do
    put_in(audio_clip.audio_file, add_url_to_audio_file(audio_clip.audio_file))
  end

  def add_url_to_audio_file(nil), do: nil

  def add_url_to_audio_file(audio_file) do
    put_in(audio_file.file[:url], Vamp.AudioFile.url(audio_file.file[:file_name], audio_file))
  end

  def add_urls_to_track_clips(track) do
    clips = Enum.map(track.audio_clips, &add_url_to_audio_clip/1)
    put_in(track.audio_clips, clips)
  end
end
