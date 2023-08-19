defmodule Vamp.Latencies.Cache do
  use GenServer

  # Client API
  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  def add_latency(server, %{"user_id" => user_id, "latency" => latency}) do
    GenServer.cast(server, {:add, %{"user_id" => user_id, "latency" => latency}})
  end

  def clear_latency(server, user_id) do
    GenServer.cast(server, {:clear, user_id})
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
    new_state =
      update_in(
        state,
        [Access.key(user_id, [])],
        &unshift_latency(&1, latency)
      )

    {:noreply, new_state}
  end

  @impl true
  def handle_cast({:clear, user_id}, state) do
    {:noreply, put_in(state, [user_id], [])}
  end

  @impl true
  def handle_call({:get, user_ids}, _from, state) when is_list(user_ids) do
    user_latencies =
      Map.take(state, user_ids)
      |> Enum.map(fn {user_id, latencies} -> {user_id, mean(latencies)} end)
      |> List.keysort(1, :desc)

    {:reply, user_latencies, state}
  end

  @impl true
  def handle_call({:get, user_id}, _from, state) when is_integer(user_id) do
    user_latencies = get_in(state, [Access.key(user_id, [])])
    {:reply, mean(user_latencies), state}
  end

  defp unshift_latency(latencies, latency) do
    cond do
      length(latencies) < 10 ->
        [latency | latencies]

      outside_standard_deviation?(latency, latencies) ->
        latencies

      true ->
        latest_twenty = Enum.slice([latency | latencies], 0..20)
        Enum.reject(latest_twenty, fn el -> outside_standard_deviation?(el, latest_twenty) end)
    end
  end

  defp outside_standard_deviation?(_, []), do: false

  defp outside_standard_deviation?(value, values) do
    abs(value - mean(values)) > standard_deviation(values)
  end

  defp standard_deviation(values) do
    values
    |> deviations()
    |> mean()
    |> :math.sqrt()
  end

  defp mean([]), do: nil

  defp mean(list) do
    Enum.sum(list) / length(list)
  end

  defp deviations(list) do
    Enum.map(list, fn elem -> (elem - mean(list)) ** 2 end)
  end
end
