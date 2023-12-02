defmodule VampWeb.ChannelAuth do
  require Logger

  @unauthorized_response {:error, %{"reason" => "unauthorized"}}

  def validate_topic_matches_socket(song_id, socket, channel) do
    cond do
      !Map.has_key?(socket.assigns, :song_id) ->
        Logger.warning("Attempted to join #{channel} but socket was missing song_id key")
        @unauthorized_response

      socket.assigns.song_id != song_id ->
        Logger.warning("Join #{channel} failed #{song_id} != #{socket.assigns.song_id}")
        @unauthorized_response

      true ->
        {:ok, socket}
    end
  end

  def validate_user_topic_matches_socket(user_id, socket, channel) do
    cond do
      !Map.has_key?(socket.assigns, :current_user) ->
        Logger.warning("Attempted to join #{channel} but socket was missing current_user key")
        @unauthorized_response

      socket.assigns.current_user.id != user_id ->
        Logger.warning("Join #{channel} failed #{user_id} != #{socket.assigns.current_user.id}")
        @unauthorized_response

      true ->
        {:ok, socket}
    end
  end
end
