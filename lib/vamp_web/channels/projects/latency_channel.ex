defmodule VampWeb.LatencyChannel do
  use Phoenix.Channel
  import VampWeb.ChannelAuth, only: [validate_topic_matches_socket: 3]
  require Logger

  @channel_prefix "latency_tracking:"

  def join(@channel_prefix <> song_id, _message, socket) do
    validate_topic_matches_socket(song_id, socket, __MODULE__)
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

  def channel_prefix(), do: @channel_prefix

  def wildcard_prefix(), do: channel_prefix() <> "*"
end
