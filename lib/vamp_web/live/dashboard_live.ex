defmodule VampWeb.DashboardLive do
  use VampWeb, :live_view

  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-sm">
      <.header>
        Hello <%= @current_user.email %>!
        <:subtitle>how do you like the app?</:subtitle>
      </.header>
      <.link navigate={~p"/liveset"} class="font-semibold text-brand hover:underline">Create a live set!</.link>
    </div>
    """
  end
end
