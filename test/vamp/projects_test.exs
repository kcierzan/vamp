defmodule Vamp.ProjectsTest do
  use Vamp.DataCase

  alias Vamp.Projects

  describe "songs" do
    alias Vamp.Projects.Song

    import Vamp.ProjectsFixtures

    @invalid_attrs %{description: nil, title: nil, bpm: nil, time_signature: nil}

    test "list_songs/0 returns all songs" do
      song = song_fixture()
      assert Projects.list_songs() == [song]
    end

    test "get_song!/1 returns the song with given id" do
      song = song_fixture()
      assert Projects.get_song!(song.id) == song
    end

    test "create_song/1 with valid data creates a song" do
      valid_attrs = %{description: "some description", title: "some title", bpm: 120.5, time_signature: "some time_signature"}

      assert {:ok, %Song{} = song} = Projects.create_song(valid_attrs)
      assert song.description == "some description"
      assert song.title == "some title"
      assert song.bpm == 120.5
      assert song.time_signature == "some time_signature"
    end

    test "create_song/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_song(@invalid_attrs)
    end

    test "update_song/2 with valid data updates the song" do
      song = song_fixture()
      update_attrs = %{description: "some updated description", title: "some updated title", bpm: 456.7, time_signature: "some updated time_signature"}

      assert {:ok, %Song{} = song} = Projects.update_song(song, update_attrs)
      assert song.description == "some updated description"
      assert song.title == "some updated title"
      assert song.bpm == 456.7
      assert song.time_signature == "some updated time_signature"
    end

    test "update_song/2 with invalid data returns error changeset" do
      song = song_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_song(song, @invalid_attrs)
      assert song == Projects.get_song!(song.id)
    end

    test "delete_song/1 deletes the song" do
      song = song_fixture()
      assert {:ok, %Song{}} = Projects.delete_song(song)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_song!(song.id) end
    end

    test "change_song/1 returns a song changeset" do
      song = song_fixture()
      assert %Ecto.Changeset{} = Projects.change_song(song)
    end
  end

  describe "tracks" do
    alias Vamp.Projects.Track

    import Vamp.ProjectsFixtures

    @invalid_attrs %{index: nil, name: nil, gain: nil, panning: nil}

    test "list_tracks/0 returns all tracks" do
      track = track_fixture()
      assert Projects.list_tracks() == [track]
    end

    test "get_track!/1 returns the track with given id" do
      track = track_fixture()
      assert Projects.get_track!(track.id) == track
    end

    test "create_track/1 with valid data creates a track" do
      valid_attrs = %{index: 42, name: "some name", gain: 120.5, panning: 120.5}

      assert {:ok, %Track{} = track} = Projects.create_track(valid_attrs)
      assert track.index == 42
      assert track.name == "some name"
      assert track.gain == 120.5
      assert track.panning == 120.5
    end

    test "create_track/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_track(@invalid_attrs)
    end

    test "update_track/2 with valid data updates the track" do
      track = track_fixture()
      update_attrs = %{index: 43, name: "some updated name", gain: 456.7, panning: 456.7}

      assert {:ok, %Track{} = track} = Projects.update_track(track, update_attrs)
      assert track.index == 43
      assert track.name == "some updated name"
      assert track.gain == 456.7
      assert track.panning == 456.7
    end

    test "update_track/2 with invalid data returns error changeset" do
      track = track_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_track(track, @invalid_attrs)
      assert track == Projects.get_track!(track.id)
    end

    test "delete_track/1 deletes the track" do
      track = track_fixture()
      assert {:ok, %Track{}} = Projects.delete_track(track)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_track!(track.id) end
    end

    test "change_track/1 returns a track changeset" do
      track = track_fixture()
      assert %Ecto.Changeset{} = Projects.change_track(track)
    end
  end

  describe "audio_clips" do
    alias Vamp.Projects.AudioClip

    import Vamp.ProjectsFixtures

    @invalid_attrs %{name: nil, type: nil, playback_rate: nil}

    test "list_audio_clips/0 returns all audio_clips" do
      audio_clip = audio_clip_fixture()
      assert Projects.list_audio_clips() == [audio_clip]
    end

    test "get_audio_clip!/1 returns the audio_clip with given id" do
      audio_clip = audio_clip_fixture()
      assert Projects.get_audio_clip!(audio_clip.id) == audio_clip
    end

    test "create_audio_clip/1 with valid data creates a audio_clip" do
      valid_attrs = %{name: "some name", type: "some type", playback_rate: 120.5}

      assert {:ok, %AudioClip{} = audio_clip} = Projects.create_audio_clip(valid_attrs)
      assert audio_clip.name == "some name"
      assert audio_clip.type == "some type"
      assert audio_clip.playback_rate == 120.5
    end

    test "create_audio_clip/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Projects.create_audio_clip(@invalid_attrs)
    end

    test "update_audio_clip/2 with valid data updates the audio_clip" do
      audio_clip = audio_clip_fixture()
      update_attrs = %{name: "some updated name", type: "some updated type", playback_rate: 456.7}

      assert {:ok, %AudioClip{} = audio_clip} = Projects.update_audio_clip(audio_clip, update_attrs)
      assert audio_clip.name == "some updated name"
      assert audio_clip.type == "some updated type"
      assert audio_clip.playback_rate == 456.7
    end

    test "update_audio_clip/2 with invalid data returns error changeset" do
      audio_clip = audio_clip_fixture()
      assert {:error, %Ecto.Changeset{}} = Projects.update_audio_clip(audio_clip, @invalid_attrs)
      assert audio_clip == Projects.get_audio_clip!(audio_clip.id)
    end

    test "delete_audio_clip/1 deletes the audio_clip" do
      audio_clip = audio_clip_fixture()
      assert {:ok, %AudioClip{}} = Projects.delete_audio_clip(audio_clip)
      assert_raise Ecto.NoResultsError, fn -> Projects.get_audio_clip!(audio_clip.id) end
    end

    test "change_audio_clip/1 returns a audio_clip changeset" do
      audio_clip = audio_clip_fixture()
      assert %Ecto.Changeset{} = Projects.change_audio_clip(audio_clip)
    end
  end
end
