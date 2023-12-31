defmodule VampWeb.PlaybackChannel do
  use Phoenix.Channel
  import VampWeb.CompensatedBroadcast, only: [broadcast_with_delay!: 4]
  import VampWeb.ChannelAuth, only: [validate_topic_matches_socket: 3]
  alias VampWeb.Presence

  @channel_prefix "song_playback:"

  def join(@channel_prefix <> song_id, _message, socket) do
    case validate_topic_matches_socket(song_id, socket, __MODULE__) do
      {:ok, socket} ->
        send(self(), :after_join)
        {:ok, socket}

      {:error, message} ->
        {:error, message}
    end
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.current_user.id, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("play_clip", data, socket) do
    socket
    |> channel_user_ids()
    |> broadcast_with_delay!(user_channel_topic_prefix(socket), "play_clip", data)

    {:noreply, socket}
  end

  def handle_in("stop_track", data, socket) do
    socket
    |> channel_user_ids()
    |> broadcast_with_delay!(user_channel_topic_prefix(socket), "stop_track", data)

    {:noreply, socket}
  end

  def handle_in("start_transport", data, socket) do
    socket
    |> channel_user_ids()
    |> broadcast_with_delay!(user_channel_topic_prefix(socket), "start_transport", data)

    {:noreply, socket}
  end

  def handle_in("stop_transport", data, socket) do
    socket
    |> channel_user_ids()
    |> broadcast_with_delay!(user_channel_topic_prefix(socket), "stop_transport", data)

    {:noreply, socket}
  end

  defp user_channel_topic_prefix(socket) do
    "song_user:#{socket.assigns.song_id}:"
  end

  defp channel_user_ids(socket) do
    Presence.list(socket) |> Map.keys()
  end

  def channel_prefix(), do: @channel_prefix

  def wildcard_prefix(), do: channel_prefix() <> "*"
end
