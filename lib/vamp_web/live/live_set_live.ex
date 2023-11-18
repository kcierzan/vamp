defmodule VampWeb.LiveSetLive do
  use VampWeb, :live_view
  use LiveSvelte.Components
  require Logger

  def render(assigns) do
    ~H"""
    <.link navigate={~p"/dashboard"} class="font-semibold text-brand hover:underline">
      &lt back to dashboard
    </.link>
    <.LiveSet ssr={true} currentUser={@current_user} song={@song} token={@token} />
    """
  end

  def mount(%{"song_id" => song_id}, _session, socket) do
    # TODO: replace `user_auth` with a better salt
    token = Phoenix.Token.sign(socket, "user auth", socket.assigns.current_user.id)
    song = Vamp.Projects.get_project!(socket.assigns.current_user.id, song_id)

    {:ok, assign(socket, token: token, song: song)}
  end
end
