defmodule VampWeb.CompensatedBroadcast do
  alias VampWeb.Endpoint

  def broadcast_with_delay!([user_id] = _user_ids, message, data) do
    Endpoint.broadcast_from!(
      self(),
      "private:" <> user_id,
      message,
      Map.merge(data, %{"waitMilliseconds" => 0})
    )
  end

  def broadcast_with_delay!(user_ids, message, data) do
    for {user_id, wait_ms} <- ms_delay_offsets(user_ids) do
      Endpoint.broadcast_from!(
        self(),
        "private:" <> user_id,
        message,
        Map.merge(data, wait_ms)
      )
    end
  end

  defp ms_delay_offsets(user_ids) do
    latencies =
      [{_slow_user, max_latency} | _faster_latencies] =
      Vamp.Latencies.Cache
      |> Vamp.Latencies.Cache.get_latency(user_ids)

    latencies
    |> Enum.map(fn {id, latency} -> {id, %{"waitMilliseconds" => (max_latency - latency) / 2}} end)
  end
end
