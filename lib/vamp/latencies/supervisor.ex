defmodule Vamp.Latencies.Supervisor do
  use Supervisor
  alias Vamp.Latencies.Cache

  def start_link(_opts) do
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    children = [
      {Cache, name: Vamp.Latencies.Cache}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
