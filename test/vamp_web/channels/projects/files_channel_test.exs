defmodule VampWeb.Projects.FilesChannelTest do
  use VampWeb.ChannelCase, async: true

  describe "join" do
    setup do
      user = Vamp.AccountsFixtures.user_fixture()
      song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

      %{user: user, song: song}
    end

    test "join is successful when the topic matches the socket song", %{user: user, song: song} do
      assert {:ok, _, _socket} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(
                 VampWeb.FilesChannel,
                 "song_files:#{song.id}"
               )
    end

    test "join fails on socket song topic song mismatch", %{user: user, song: song} do
      assert {:error, %{"reason" => "unauthorized"}} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(
                 VampWeb.FilesChannel,
                 "song_files:foobar"
               )
    end
  end

  describe "handle_in audio file JSON" do
    setup do
      user = Vamp.AccountsFixtures.user_fixture()
      song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

      {:ok, _, socket} =
        VampWeb.UserSocket
        |> socket("user_id", %{current_user: user, song_id: song.id})
        |> subscribe_and_join(
          VampWeb.FilesChannel,
          "song_files:#{song.id}"
        )

      %{user: user, song: song, socket: socket}
    end

    test "JSON is parsed, an audio file is created, and a pool item is broadcast", %{
      song: song,
      socket: socket
    } do
      song_data_topic = "song_data:#{song.id}"
      VampWeb.Endpoint.subscribe(song_data_topic)

      {:ok, audio_bytes} = File.read("test/support/fixtures/samples/100action.wav")

      file_attrs = %{
        "media_type" => "audio/wav",
        "size" => 100,
        "name" => "action.wav",
        "bpm" => 100.0,
        "description" => "test file",
        "song_id" => song.id
      }

      push(socket, Jason.encode!(file_attrs), {:binary, audio_bytes})

      assert_receive %Phoenix.Socket.Broadcast{
        topic: ^song_data_topic,
        event: "new_pool_file",
        payload: %Vamp.Sounds.AudioFile{name: "action.wav", description: "test file"}
      }

      VampWeb.Endpoint.unsubscribe(song_data_topic)
    end
  end
end
