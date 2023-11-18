defmodule VampWeb.Projects.UserChannelTest do
  use VampWeb.ChannelCase, async: true

  setup do
    user = Vamp.AccountsFixtures.user_fixture()
    song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

    %{user: user, song: song}
  end

  describe "join" do
    test "join succeeds when the user id and song match the channel", %{user: user, song: song} do
      assert {:ok, _, _socket} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(
                 VampWeb.UserChannel,
                 "song_user:" <> song.id <> ":" <> user.id
               )
    end

    test "join fails when the user id does not match the channel", %{user: user, song: song} do
      other_user = Vamp.AccountsFixtures.user_fixture()

      assert {:error, %{"reason" => "unauthorized"}} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(
                 VampWeb.UserChannel,
                 "song_user:" <> song.id <> other_user.id
               )
    end

    test "join fails when the song id does not match the channel", %{user: user, song: song} do
      other_song = Vamp.ProjectsFixtures.song_fixture()

      assert {:error, %{"reason" => "unauthorized"}} =
               VampWeb.UserSocket
               |> socket("user_id", %{current_user: user, song_id: song.id})
               |> subscribe_and_join(
                 VampWeb.UserChannel,
                 "song_user:" <> other_song.id <> user.id
               )
    end
  end
end
