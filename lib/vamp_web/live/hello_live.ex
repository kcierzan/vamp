# Phoenix Live View! Think of it like a websocket controller.
# Elixir looks like Ruby but the similarities pretty much end there.

defmodule VampWeb.HelloLive do
  use VampWeb, :live_view
  # Enables <.MySvelteComponent my_prop={@my_prop_value} /> syntax
  # From the LiveSvelete library which adds svelte-phoenix integration.
  use LiveSvelte.Components

  # Mount is called on first pageload. We set some data on the socket. 
  # After this, `render` is called, with the value of `socket.assigns`.
  # You can think of the `socket.assigns` as the way we maintain the 
  # state of the websocket connection.
  def mount(_params, _session, socket) do
    {:ok, assign(socket, :number, 1)}
  end

  # Handle the 'set_number' events from the client by extracting the value of
  # 'number' from params, then assign it to the socket, which
  # automatically triggers a call to `render`, which in turn updates
  # the client. Here we are just passing `number` through...
  def handle_event("set_number", %{"number" => number}, socket) do
    {:noreply, assign(socket, :number, number)}
  end

  # Send stuff to the client. On first pageload, this is a regular
  # HTML HTTP response, after the client connects via websocket
  # and `mount` is called, we send only props as JSON-encoded data.
  # The `@number` syntax is sugar for `assigns.number`. Here,
  # we are passing in `assigns.number` to the Hello.svelete component
  # as a prop.
  def render(assigns) do
    ~H"""
    <.Clip />
    """
  end
end
