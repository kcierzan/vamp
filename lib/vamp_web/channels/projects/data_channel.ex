defmodule VampWeb.DataChannel do
  use Phoenix.Channel
  import VampWeb.ChannelAuth, only: [validate_topic_matches_socket: 3]
  import Vamp.Projects

  @channel_prefix "song_data:"

  def join("song_data:" <> song_id, _message, socket) do
    validate_topic_matches_socket(song_id, socket, __MODULE__)
  end

  def handle_in("new_track", attrs, socket) do
    track = create_track!(attrs)
    broadcast!(socket, "new_track", track)

    {:noreply, socket}
  end

  def handle_in("new_track_from_clip", attrs, socket) do
    track = create_track_and_associate_clip!(attrs)
    broadcast!(socket, "new_track_from_clip", track)

    {:noreply, socket}
  end

  def handle_in("new_clip", data, socket) do
    audio_clip = create_audio_clip!(data)

    case audio_clip.audio_file do
      %Vamp.Sounds.AudioFile{} ->
        broadcast!(socket, "new_clip", audio_clip)
        {:noreply, socket}

      _ ->
        {:reply, {:error, %{"reason" => "unexpected value for audio_file"}}, socket}
    end
  end

  def handle_in("update_clips", attrs, socket) do
    %{"clips" => clips} = attrs
    {:ok, updated} = update_audio_clips(clips)
    broadcast!(socket, "update_clips", %{"clips" => updated})

    {:noreply, socket}
  end

  def channel_prefix(), do: @channel_prefix

  def wildcard_prefix(), do: channel_prefix() <> "*"
end
