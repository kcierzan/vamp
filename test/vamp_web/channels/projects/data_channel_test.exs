defmodule VampWeb.Projects.DataChannelTest do
  use VampWeb.ChannelCase, async: true

  setup do
    user = Vamp.AccountsFixtures.user_fixture()
    song = Vamp.ProjectsFixtures.song_fixture(%{created_by_id: user.id})

    {:ok, _, socket} =
      VampWeb.UserSocket
      |> socket("user_id", %{current_user: user, song_id: song.id})
      |> subscribe_and_join(VampWeb.DataChannel, "song_data:" <> song.id)

    %{user: user, song: song, socket: socket}
  end

  describe "new_clip" do
    test "new_clip with audio_file broadcasts the clip", %{socket: socket, song: song} do
      track = Vamp.ProjectsFixtures.track_fixture(%{song_id: song.id})
      audio_file = Vamp.SoundsFixtures.audio_file_fixture()
      audio_file_id = audio_file.id

      push(socket, "new_clip", %{
        "name" => "my new clip",
        "type" => "audio/wav",
        "index" => 0,
        "playback_rate" => 1.0,
        "track_id" => track.id,
        "audio_file_id" => audio_file.id
      })

      assert_broadcast "new_clip", %Vamp.Projects.AudioClip{
        audio_file_id: ^audio_file_id,
        name: "my new clip"
      }
    end
  end

  describe "update_clips" do
    test "update_clips updates the attributes of an audio_clip", %{socket: socket, song: song} do
      track = Vamp.ProjectsFixtures.track_fixture(%{song_id: song.id})
      audio_clip = Vamp.ProjectsFixtures.audio_clip_fixture(%{track_id: track.id})
      clip_id = audio_clip.id
      assert audio_clip.name == "some name"

      updated_attrs =
        %{audio_clip | name: "new name"}
        |> Map.from_struct()
        |> Map.new(fn {k, v} -> {to_string(k), v} end)

      push(socket, "update_clips", %{
        "clips" => [updated_attrs]
      })

      assert_broadcast "update_clips", %{
        "clips" => [%Vamp.Projects.AudioClip{name: "new name", id: ^clip_id}]
      }
    end
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
        song_id: ^song_id,
        name: "my track",
        audio_clips: [%{name: "my new clip"}]
      }
    end
  end
end
