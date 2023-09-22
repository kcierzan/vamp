defmodule VampWeb.LiveSetChannelTest do
  use VampWeb.ChannelCase

  setup do
    song = Vamp.ProjectsFixtures.song_fixture() |> Vamp.Repo.preload(:created_by)

    {:ok, _, socket} =
      VampWeb.UserSocket
      |> socket("user_id", %{current_user: song.created_by})
      |> subscribe_and_join(VampWeb.LiveSetChannel, "liveset:shared")

    %{socket: socket, song: song}
  end

  describe "new_track" do
    test "new_track creates a track", %{socket: socket, song: song} do
      song_id = song.id
      push(socket, "new_track", %{
        "name" => "my track",
        "gain" => 0.0,
        "panning" => 0.0,
        "song_id" => song.id,
        "audio_clips" => [
          %{
            "name" => "my new clip",
            "type" => "audio/wav",
            "playback_rate" => 1.2,
            "index" => 0
          }
        ]
      })

      assert_broadcast "new_track", %Vamp.Projects.Track{
        song_id: song_id,
        name: "my track",
        audio_clips: [%{name: "my new clip"}]
      }
    end
  end
end
