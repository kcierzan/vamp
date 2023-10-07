defmodule VampWeb.LiveSetChannel do
  # The Fat Controller laughed. "You are wrong."
  use Phoenix.Channel
  alias VampWeb.Presence
  alias VampWeb.Endpoint
  require Logger

  # TODO: there should be a unique 'shared' channel for each liveset
  # (eg. `liveset:<liveset_id>:shared`)
  def join("liveset:shared", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  # TODO: there should be a single private channel per user. (users can only be in one liveset at a time)
  # we probably want to namespace this under the liveset just to keep organized (eg. `liveset:<liveset_id>:<user_id>`)
  def join("private:" <> _private_room_id, _params, socket) do
    {:ok, socket}
  end

  def join("files:clip", _message, socket) do
    {:ok, socket}
  end

  def handle_in("ping", %{"client_time" => client_time}, socket) do
    now = DateTime.utc_now(:millisecond) |> DateTime.to_unix(:millisecond)
    up = now - client_time
    {:reply, {:ok, %{"up" => up, "server_time" => now}}, socket}
  end

  def handle_in("report_latency", %{"latency" => latency}, socket) do
    current_user_id = socket.assigns.current_user.id

    Vamp.Latencies.Cache.add_latency(Vamp.Latencies.Cache, %{
      "user_id" => current_user_id,
      "latency" => latency
    })

    {:noreply, socket}
  end

  def handle_in("get_latency", _data, socket) do
    current_user_id = socket.assigns.current_user.id
    latency = Vamp.Latencies.Cache.get_latency(Vamp.Latencies.Cache, current_user_id)
    {:reply, {:ok, latency}, socket}
  end

  def handle_in("clear_latency", _data, socket) do
    current_user_id = socket.assigns.current_user.id
    Vamp.Latencies.Cache.clear_latency(Vamp.Latencies.Cache, current_user_id)
    {:noreply, socket}
  end

  def handle_in("new_track", attrs, socket) do
    track = Vamp.Projects.create_track!(attrs)
    broadcast!(socket, "new_track", track)

    {:noreply, socket}
  end

  def handle_in("new_track_from_clip", attrs, socket) do
    track = Vamp.Projects.create_track_and_associate_clip!(attrs)
    broadcast!(socket, "new_track_from_clip", track)

    {:noreply, socket}
  end

  def handle_in("new_clip", data, socket) do
    audio_clip = Vamp.Projects.create_audio_clip!(data)

    case audio_clip.audio_file do
      %Vamp.Sounds.AudioFile{} ->
        broadcast!(socket, "new_clip", audio_clip)
        {:noreply, socket}

      nil ->
        {:reply, {:ok, audio_clip.id}, socket}

      _ ->
        {:reply, {:error, %{"reason" => "unexpected value for audio_file"}}, socket}
    end
  end

  def handle_in("update_clips", attrs, socket) do
    %{"clips" => clips} = attrs
    {:ok, updated} = Vamp.Projects.update_audio_clips!(clips)
    broadcast!(socket, "update_clips", %{"clips" => updated})

    {:noreply, socket}
  end

  def handle_in("play_clip", data, socket) do
    socket
    |> shared_channel_user_ids()
    |> broadcast_with_latency_compensation!("play_clip", data)

    {:noreply, socket}
  end

  def handle_in("stop_track", data, socket) do
    socket
    |> shared_channel_user_ids()
    |> broadcast_with_latency_compensation!("stop_track", data)

    {:noreply, socket}
  end

  def handle_in("start_transport", data, socket) do
    socket
    |> shared_channel_user_ids()
    |> broadcast_with_latency_compensation!("start_transport", data)

    {:noreply, socket}
  end

  def handle_in("stop_transport", data, socket) do
    socket
    |> shared_channel_user_ids()
    |> broadcast_with_latency_compensation!("stop_transport", data)

    {:noreply, socket}
  end

  def handle_in(audio_file_json, {:binary, data}, socket) do
    audio_file_json
    |> Jason.decode!()
    |> add_file_attr(data)
    |> Vamp.Sounds.create_pool_audio_file()
    |> broadcast_new_clip_or_pool_item!()

    {:noreply, socket}
  end

  defp broadcast_new_clip_or_pool_item!(data) do
    case data do
      %Vamp.Projects.AudioClip{} ->
        broadcast_to_liveset_channel!(data, "new_clip")

      %Vamp.Sounds.AudioFile{} ->
        broadcast_to_liveset_channel!(data, "new_pool_file")
    end
  end

  defp broadcast_to_liveset_channel!(data, message) do
    Endpoint.broadcast_from(self(), "liveset:shared", message, data)
  end

  defp add_file_attr(attrs, data) do
    put_in(attrs["file"], %{filename: URI.encode(attrs["name"]), binary: data})
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.current_user.id, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  defp broadcast_with_latency_compensation!([user_id] = _user_ids, message, data) do
    broadcast_to_private_channel!(user_id, message, Map.merge(data, %{"waitMilliseconds" => 0}))
  end

  defp broadcast_with_latency_compensation!(user_ids, message, data) do
    for {user_id, wait_ms} <- ms_delay_offsets(user_ids) do
      broadcast_to_private_channel!(user_id, message, Map.merge(data, wait_ms))
    end
  end

  defp broadcast_to_private_channel!(user_id, message, data) do
    Endpoint.broadcast_from!(self(), "private:" <> user_id, message, data)
  end

  defp ms_delay_offsets(user_ids) do
    latencies =
      [{_slow_user, max_latency} | _faster_latencies] =
      Vamp.Latencies.Cache
      |> Vamp.Latencies.Cache.get_latency(user_ids)

    latencies
    |> Enum.map(fn {id, latency} -> {id, %{"waitMilliseconds" => (max_latency - latency) / 2}} end)
  end

  defp shared_channel_user_ids(socket) do
    Presence.list(socket) |> Map.keys()
  end
end
