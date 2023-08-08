defmodule Vamp.Latencies.CacheTest do
  use ExUnit.Case, async: true

  alias Vamp.Latencies.Cache

  setup do
    cache = start_supervised!(Cache)
    %{cache: cache}
  end

  describe "get_latency/2" do
    test "can add latencies and get the mean", %{cache: cache} do
      latencies = [23, 10, 12, 14]

      for ping <- latencies do
        Cache.add_latency(cache, %{"user_id" => 12, "latency" => ping})
      end

      assert Cache.get_latency(cache, 12) == 14.75
    end

    test "can add latencies and ignore outliers", %{cache: cache} do
      latencies = for _ <- 0..9, do: Enum.random(0..10)
      latencies_with_outlier = latencies ++ [90]
      expected_mean = Enum.sum(latencies) / length(latencies)

      for ping <- latencies_with_outlier do
        Cache.add_latency(cache, %{"user_id" => 12, "latency" => ping})
      end

      assert Cache.get_latency(cache, 12) == expected_mean
    end

    test "can add and get cache for multiple users", %{cache: cache} do
      user_ids = [1, 2, 4, 22, 63]

      user_latencies =
        Enum.reduce(
          user_ids,
          %{},
          fn id, acc ->
            put_in(acc[id], for(_ <- 0..9, do: Enum.random(0..10)))
          end
        )

      for {id, latencies} <- user_latencies do
        for ping <- latencies do
          Cache.add_latency(cache, %{"user_id" => id, "latency" => ping})
        end
      end

      for id <- user_ids do
        assert Cache.get_latency(cache, id) ==
                 Enum.sum(user_latencies[id]) / length(user_latencies[id])
      end
    end

    test "returns nil when the user has no latencies", %{cache: cache} do
      assert Cache.get_latency(cache, 12) == nil
    end
  end

  describe "clear_latency/2" do
    test "can clear latencies for a user", %{cache: cache} do
      Cache.add_latency(cache, %{"user_id" => 12, "latency" => 23})
      assert Cache.get_latency(cache, 12) == 23
      Cache.clear_latency(cache, 12)
      assert Cache.get_latency(cache, 12) == nil
    end
  end
end
