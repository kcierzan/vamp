defmodule VampWeb.LiveSetLive do
  use VampWeb, :live_view
  use LiveSvelte.Components

  def render(assigns) do
    ~H"""
    <.link navigate={~p"/dashboard"} class="font-semibold text-brand hover:underline">&lt back to dashboard</.link>
    <.LiveSet ssr={true} currentEmail={assigns.current_user.email} />
    """
  end
end