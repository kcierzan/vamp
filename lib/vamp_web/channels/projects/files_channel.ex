defmodule VampWeb.FilesChannel do
  use Phoenix.Channel
  alias VampWeb.Endpoint
  import VampWeb.ChannelAuth, only: [validate_topic_matches_socket: 3]
  require Logger

  @channel_prefix "song_files:"

  def join(@channel_prefix <> song_id, _message, socket) do
    validate_topic_matches_socket(song_id, socket, __MODULE__)
  end

  @spec handle_in(
          binary()
          | maybe_improper_list(
              binary() | maybe_improper_list(any(), binary() | []) | byte(),
              binary() | []
            ),
          {:binary, any()},
          any()
        ) :: {:noreply, any()}
  def handle_in(audio_file_json, {:binary, data}, socket) do
    audio_file_attrs = Jason.decode!(audio_file_json)
    %{"song_id" => song_id} = audio_file_attrs

    audio_file_attrs
    |> add_waffle_file_attr(data)
    |> Vamp.Sounds.create_pool_audio_file()
    |> broadcast_new_pool_item!(song_id)

    {:noreply, socket}
  end

  # TODO: move this to functional core
  defp add_waffle_file_attr(attrs, data) do
    put_in(attrs["file"], %{filename: URI.encode(attrs["name"]), binary: data})
  end

  defp broadcast_new_pool_item!(audio_file, song_id) do
    Endpoint.broadcast_from(
      self(),
      "song_data:" <> song_id,
      "new_pool_file",
      audio_file
    )
  end

  def channel_prefix(), do: @channel_prefix

  def wildcard_prefix(), do: channel_prefix() <> "*"
end
