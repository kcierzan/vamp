defmodule VampWeb.Projects.PlaybackChannelTest do
  use VampWeb.ChannelCase, async: true

  setup do
    user_1 = Vamp.AccountsFixtures.user_fixture()
    user_2 = Vamp.AccountsFixtures.user_fixture()
    song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user_1.id})

    {:ok, _, socket_1} =
      VampWeb.UserSocket
      |> socket("user_id", %{current_user: user_1, song_id: song.id})
      |> subscribe_and_join(
        VampWeb.PlaybackChannel,
        "song_playback:#{song.id}"
      )

    {:ok, _, _socket_2} =
      VampWeb.UserSocket
      |> socket("user_id", %{current_user: user_2, song_id: song.id})
      |> subscribe_and_join(
        VampWeb.PlaybackChannel,
        "song_playback:#{song.id}"
      )

    %{user_1: user_1, song: song, socket_1: socket_1, user_2: user_2}
  end

  @tag :skip
  describe "play_clip" do
    test "broadcasts to other clients with delay", %{
      socket_1: socket_1,
      user_1: user_1,
      user_2: user_2,
      song: song
    } do
      user_topic = "song_user:#{song.id}:#{user_2.id}"
      VampWeb.Endpoint.subscribe(user_topic)
      push(socket_1, "play_clip", %{clips: [%{id: 1, name: "test clip"}]})

      assert_receive %Phoenix.Socket.Broadcast{
        topic: ^user_topic,
        event: "play_clip",
        payload: %{"clips" => [%{"id" => 1, "name" => "test clip"}]}
      }

      VampWeb.Endpoint.unsubscribe(user_topic)
    end
  end
end
