defmodule Vamp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {NodeJS.Supervisor, [path: LiveSvelte.SSR.server_path(), pool_size: 4]},
      # Start the Telemetry supervisor
      VampWeb.Telemetry,
      # Start the Ecto repository
      Vamp.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Vamp.PubSub},
      # Start Finch
      {Finch, name: Vamp.Finch},
      # Start the Endpoint (http/https)
      VampWeb.Endpoint,
      # Start a worker by calling: Vamp.Worker.start_link(arg)
      # {Vamp.Worker, arg}
      # Start latency calculator
      Vamp.Latencies.Supervisor
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Vamp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    VampWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
