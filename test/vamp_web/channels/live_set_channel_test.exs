defmodule VampWeb.LiveSetChannelTest do
  use VampWeb.ChannelCase, async: true

  setup do
    song = Vamp.ProjectsFixtures.song_fixture() |> Vamp.Repo.preload(:created_by)

    {:ok, _, socket} =
      VampWeb.UserSocket
      |> socket("user_id", %{current_user: song.created_by})
      |> subscribe_and_join(VampWeb.LiveSetChannel, "liveset:shared")

    %{socket: socket, song: song}
  end

  describe "ping" do
    test "ping calculates upstream latency and responds with server time", %{socket: socket} do
      client_time = DateTime.utc_now(:millisecond) |> DateTime.to_unix(:millisecond)
      ref = push(socket, "ping", %{"client_time" => client_time})
      assert_reply ref, :ok, %{"up" => _upstream, "server_time" => _server_time}
    end
  end

  describe "latency" do
    test "report latency stores a user latency in the cache", %{socket: socket} do
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

  describe "new_clip" do
    test "new_clip creates a clip for a track", %{socket: socket, song: song} do
      track = Vamp.ProjectsFixtures.track_fixture(%{song_id: song.id})

      ref =
        push(socket, "new_clip", %{
          "name" => "my new clip",
          "type" => "audio/wav",
          "index" => 0,
          "playback_rate" => 1.0,
          "track_id" => track.id
        })

      assert_reply ref, :ok, _id
    end

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

  describe "update_clip" do
    test "update_clip updates the attributes of an audio_clip", %{socket: socket, song: song} do
      track = Vamp.ProjectsFixtures.track_fixture(%{song_id: song.id})
      audio_clip = Vamp.ProjectsFixtures.audio_clip_fixture(%{track_id: track.id})
      clip_id = audio_clip.id
      assert audio_clip.name == "some name"

      push(socket, "update_clip", Map.from_struct(%{audio_clip | name: "new name"}))
      assert_broadcast "update_clip", %Vamp.Projects.AudioClip{name: "new name", id: ^clip_id}
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
