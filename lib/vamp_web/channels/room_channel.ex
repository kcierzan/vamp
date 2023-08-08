defmodule VampWeb.RoomChannel do
  use Phoenix.Channel
  alias VampWeb.Presence

  def join("room:session", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
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

  def handle_in(message, data, socket) do
    broadcast!(socket, message, data)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.current_user.id, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
end
