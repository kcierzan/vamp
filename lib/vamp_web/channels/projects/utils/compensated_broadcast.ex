defmodule VampWeb.CompensatedBroadcast do
  alias VampWeb.Endpoint
  require Logger

  def broadcast_with_delay!([user_id] = _user_ids, topic, message, data) do
    broadcast(user_id, topic, message, data, %{"waitMilliseconds" => 0})
  end

  def broadcast_with_delay!(user_ids, topic, message, data) do
    ms_delay_offsets(user_ids)
    |> Enum.each(fn {user_id, wait_ms} -> broadcast(user_id, topic, message, data, wait_ms) end)
  end

  defp broadcast(user_id, topic, message, data, wait_ms) do
    Endpoint.broadcast_from!(
      self(),
      "#{topic}#{user_id}",
      message,
      Map.merge(data, wait_ms)
    )
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
