defmodule VampWeb.Projects.LatencyChannelTest do
  use VampWeb.ChannelCase, async: true

  describe "join" do
    test "succeeds when the user and song match the channel" do
      user = Vamp.AccountsFixtures.user_fixture()
      song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

      assert {:ok, _, _socket} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(VampWeb.LatencyChannel, "latency_tracking:#{song.id}")
    end
  end

  describe "ping" do
    setup do
      user = Vamp.AccountsFixtures.user_fixture()
      song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

      {:ok, _, socket} =
        VampWeb.UserSocket
        |> socket("user_id", %{current_user: user, song_id: song.id})
        |> subscribe_and_join(VampWeb.LatencyChannel, "latency_tracking:#{song.id}")

      %{user: user, song: song, socket: socket}
    end

    test "calculates upstream latency and respond with server time", %{socket: socket} do
      client_time = DateTime.utc_now(:millisecond) |> DateTime.to_unix(:millisecond)
      ref = push(socket, "ping", %{"client_time" => client_time})
      assert_reply ref, :ok, %{"up" => _upstream, "server_time" => _server_time}
    end
  end

  describe "latency" do
    setup do
      user = Vamp.AccountsFixtures.user_fixture()
      song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

      {:ok, _, socket} =
        VampWeb.UserSocket
        |> socket("user_id", %{current_user: user, song_id: song.id})
        |> subscribe_and_join(VampWeb.LatencyChannel, "latency_tracking:#{song.id}")

      %{user: user, song: song, socket: socket}
    end

    test "report_latency stores a user latency in the cache", %{socket: socket} do
      push(socket, "report_latency", %{"latency" => 442})
      ref = push(socket, "get_latency", %{})
      assert_reply ref, :ok, 442.0
    end

    test "clear_latency clears latency for a user", %{socket: socket} do
      push(socket, "report_latency", %{"latency" => 123})
      get_ref = push(socket, "get_latency", %{})
      assert_reply get_ref, :ok, 123.0
      push(socket, "clear_latency", %{})
      cleared_ref = push(socket, "get_latency", %{})
      assert_reply cleared_ref, :ok, nil
    end
  end
end
