defmodule VampWeb.UserChannel do
  use Phoenix.Channel
  import VampWeb.ChannelAuth
  require Logger

  @channel_prefix "song_user:"

  def join(@channel_prefix <> song_id_user_id, _params, socket) do
    with [song_id, user_id] <- String.split(song_id_user_id, ":"),
         {:ok, socket} <- validate_topic_matches_socket(song_id, socket, __MODULE__),
         {:ok, socket} <- validate_user_topic_matches_socket(user_id, socket, __MODULE__) do
      {:ok, socket}
    else
      {:error, reason} ->
        {:error, reason}

      _ ->
        {:error, %{"reason" => "unauthorized"}}
    end
  end

  def channel_prefix(), do: @channel_prefix

  def wildcard_prefix(), do: channel_prefix() <> "*"
end
