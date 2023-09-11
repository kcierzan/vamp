defmodule VampWeb.DashboardLive do
  use VampWeb, :live_view

  def mount(_params, _session, socket) do
    songs = Vamp.Projects.list_songs(socket.assigns.current_user.id)
    {:ok, assign(socket, songs: songs)}
  end

  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-sm">
      <.header>
        Hello <%= @current_user.email %>!
        <:subtitle>how do you like the app?</:subtitle>
      </.header>
      <.link navigate={~p"/liveset"} class="font-semibold text-brand hover:underline">
        Create a live set!
      </.link>
    </div>
      <h2>My Songs</h2>
      <ul :for={song <- @songs}>
        <li>
          <.link navigate={~p"/liveset/#{song.id}"}><%= song.title %></.link>
          <span> - </span>
          <span><%= song.description %></span>
        </li>
      </ul>
    """
  end
end
