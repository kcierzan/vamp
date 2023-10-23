defmodule VampWeb.ChannelAuth do
  require Logger

  def validate_topic_matches_socket(song_id, socket, channel) do
    if song_id == to_string(socket.assigns.song.id) do
      {:ok, socket}
    else
      Logger.error("Join #{channel} failed #{song_id} != #{socket.assigns.song.id}")
      {:error, %{"reason" => "unauthorized"}}
    end
  end

  def validate_user_topic_matches_socket(user_id, socket, channel) do
    if user_id == to_string(socket.assigns.current_user.id) do
      {:ok, socket}
    else
      Logger.error("Join #{channel} failed #{user_id} != #{socket.assigns.current_user.id}")
      {:error, %{"reason" => "unauthorized"}}
    end
  end
end
