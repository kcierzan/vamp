defmodule VampWeb.DashboardLive do
  use VampWeb, :live_view
  alias Vamp.Projects.{Song}

  def mount(_params, _session, socket) do
    songs = Vamp.Projects.list_songs(socket.assigns.current_user.id)
    form = to_form(Vamp.Projects.change_song(%Song{}))
    {:ok, assign(socket, songs: songs, form: form)}
  end

  def handle_event("save", %{"song" => song_params}, socket) do
    case(
      Vamp.Projects.create_song(
        Map.merge(song_params, %{"created_by_id" => socket.assigns.current_user.id})
      )
    ) do
      {:ok, song} ->
        {:noreply,
         socket
         |> put_flash(:info, "song created")
         |> redirect(to: ~p"/liveset/#{song.id}")}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign(socket, form: to_form(changeset))}
    end
  end

  def handle_event("validate", %{"song" => params}, socket) do
    form =
      %Song{}
      |> Vamp.Projects.change_song(params)
      |> Map.put(:action, :insert)
      |> to_form()

    {:noreply, assign(socket, form: form)}
  end

  def render(assigns) do
    ~H"""
    <div class="mb-8">
      <.header>My Songs</.header>
      <ul :for={song <- @songs}>
        <li class="font-semibold text-brand hover:underline">
          <.link navigate={~p"/liveset/#{song.id}"}>
            <%= song.title %> - <%= song.description %>
          </.link>
        </li>
      </ul>
    </div>
    <div class="mb-8">
      <.header>
        Create a new song
      </.header>
      <.form for={@form} phx-change="validate" phx-submit="save">
        <.input label="Title" type="text" field={@form[:title]} />
        <.input label="Description" type="text" field={@form[:description]} />
        <.input label="Beats Per Minute" type="number" field={@form[:bpm]} />
        <.button class="mt-4">Save</.button>
      </.form>
    </div>
    """
  end
end
