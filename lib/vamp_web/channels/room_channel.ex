defmodule VampWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:session", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_clip", msg, socket) do
    broadcast!(socket, "new_clip", msg)
    {:noreply, socket}
  end

  def handle_in("play_clip", msg, socket) do
    broadcast!(socket, "play_clip", msg)
    {:noreply, socket}
  end

  def handle_in("stop_clip", msg, socket) do
    broadcast!(socket, "stop_clip", msg)
    {:noreply, socket}
  end
end
