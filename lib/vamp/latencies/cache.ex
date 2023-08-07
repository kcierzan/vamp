defmodule Vamp.Latencies.Cache do
  use GenServer

  # Client API
  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  def add_latency(server, %{"user_id" => user_id, "latency" => latency}) do
    GenServer.cast(server, {:add, %{"user_id" => user_id, "latency" => latency}})
  end

  def get_latency(server, user_id) do
    GenServer.call(server, {:get, user_id})
  end

  # Server callbacks
  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:add, %{"user_id" => user_id, "latency" => latency}}, state) do
    {_old_state, new_state} =
      get_and_update_in(
        state,
        [Access.key(user_id, [])],
        fn latencies ->
          new_latencies = unshift_latency(latencies, latency)
          {latencies, new_latencies}
        end
      )

    {:noreply, new_state}
  end

  @impl true
  def handle_call({:get, user_id}, _from, state) do
    user_latencies = get_in(state, [Access.key(user_id, [])])
    {:reply, average(user_latencies), state}
  end

  defp unshift_latency(latencies, latency) do
    cond do
      length(latencies) < 10 ->
        [latency | latencies]

      outside_standard_deviation?(latency, latencies) ->
        latencies

      true ->
        Enum.slice([latency | latencies], 0..20)
    end
  end

  defp outside_standard_deviation?(_, []), do: false

  defp outside_standard_deviation?(value, values) do
    abs(value - average(values)) > standard_deviation(values)
  end

  defp standard_deviation(values) do
    values
    |> deviations()
    |> average()
    |> :math.sqrt()
  end

  defp average([]), do: nil

  defp average(list) do
    Enum.sum(list) / length(list)
  end

  defp deviations(list) do
    Enum.map(list, fn elem -> (elem - average(list)) ** 2 end)
  end
end
