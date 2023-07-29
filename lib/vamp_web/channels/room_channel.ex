defmodule VampWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:session", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in(message, data, socket) do
    broadcast!(socket, message, data)
    {:noreply, socket}
  end
end
