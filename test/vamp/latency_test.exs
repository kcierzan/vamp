defmodule Vamp.LatencyTest do
  use ExUnit.Case, async: true

  alias Vamp.Latency

  setup do
    latency = start_supervised!(Latency)
    %{latency: latency}
  end

  describe "get_latency/2" do
    test "can add latencies and get the average", %{latency: latency} do
      Vamp.Latency.add_latency(latency, %{"user_id" => 12, "latency" => 23})
      Vamp.Latency.add_latency(latency, %{"user_id" => 12, "latency" => 10})
      Vamp.Latency.add_latency(latency, %{"user_id" => 12, "latency" => 12})
      Vamp.Latency.add_latency(latency, %{"user_id" => 12, "latency" => 14})
      assert Vamp.Latency.get_latency(latency, 12) == 14.75
    end

    test "can add latencies and ignore outliers", %{latency: latency} do
      latencies = for _ <- 0..9, do: Enum.random(0..10)
      with_outlier = latencies ++ [90]
      expected_average = Enum.sum(latencies) / Enum.count(latencies)

      Enum.map(
        with_outlier,
        &Vamp.Latency.add_latency(latency, %{"user_id" => 12, "latency" => &1})
      )

      assert Vamp.Latency.get_latency(latency, 12) == expected_average
    end
  end
end
