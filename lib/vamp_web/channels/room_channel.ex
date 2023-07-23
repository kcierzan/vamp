defmodule VampWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:session", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
      {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_clip", clip, socket) do
    broadcast!(socket, "new_clip", clip)
    {:noreply, socket}
  end
end
