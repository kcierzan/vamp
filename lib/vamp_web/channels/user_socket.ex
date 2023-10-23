defmodule VampWeb.UserSocket do
  use Phoenix.Socket
  alias Vamp.Accounts.User
  alias Vamp.Repo

  alias VampWeb.{
    DataChannel,
    UserChannel,
    FilesChannel,
    PlaybackChannel,
    LatencyChannel
  }

  require Logger

  # A Socket handler
  #
  # It's possible to control the websocket connection and
  # assign values that can be accessed by your channel topics.

  ## Channels
  # Uncomment the following line to define a "room:*" topic
  # pointing to the `VampWeb.RoomChannel`:
  #
  channel DataChannel.wildcard_prefix(), DataChannel
  channel UserChannel.wildcard_prefix(), UserChannel
  channel FilesChannel.wildcard_prefix(), FilesChannel
  channel PlaybackChannel.wildcard_prefix(), PlaybackChannel

  channel LatencyChannel.wildcard_prefix(), LatencyChannel

  # To create a channel file, use the mix task:
  #
  #     mix phx.gen.channel Room
  #
  # See the [`Channels guide`](https://hexdocs.pm/phoenix/channels.html)
  # for further details.

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error` or `{:error, term}`. To control the
  # response the client receives in that case, [define an error handler in the
  # websocket
  # configuration](https://hexdocs.pm/phoenix/Phoenix.Endpoint.html#socket/3-websocket-configuration).
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  @impl true
  def connect(%{"token" => token, "song_id" => song_id}, socket, _connect_info) do
    case Phoenix.Token.verify(socket, "user auth", token, max_age: 86400) do
      {:ok, user_id} ->
        socket =
          socket
          |> assign(:current_user, Repo.get!(User, user_id))
          |> assign(:song_id, Vamp.Projects.get_project!(user_id, song_id))

        {:ok, socket}

      {:error, err} ->
        Logger.error("#{__MODULE__} connect error: #{inspect(err)}")
        :error
    end
  end

  @impl true
  def connect(_params, _socket, _connect_info) do
    Logger.error("#{__MODULE__} connect error: missing params")
    :error
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Elixir.VampWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(%{assigns: %{current_user: user}}) do
    "user_socket:#{user.id}"
  end
end
