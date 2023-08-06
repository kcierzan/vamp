defmodule Vamp.Latency do
  use GenServer

  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:ping, data}, pings) do
    {_prev_state, new_state} = update_pings(pings, data)
    {:noreply, new_state}
  end

  def update_pings(pings, data) do
    path = [Access.key(data["set_id"], %{}), Access.key(data["user_id"], %{})]

    pings
    |> get_and_update_in(
      path ++ [Access.key("upstream", [])],
      &{&1, [data["upstream"] | &1]}
    )
    |> get_and_update_in(
      path ++ [Access.key("downstream", [])],
      &{&1, [data["downstream"] | &1]}
    )
  end
end
