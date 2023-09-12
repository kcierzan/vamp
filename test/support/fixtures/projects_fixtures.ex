defmodule Vamp.ProjectsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Vamp.Projects` context.
  """

  @doc """
  Generate a song.
  """
  def song_fixture(user, attrs \\ %{}) do
    {:ok, song} =
      %{
        title: "some title",
        created_by_id: user.id
      }
      |> Enum.into(attrs)
      |> Vamp.Projects.create_song()

    song
  end

  @doc """
  Generate a track.
  """
  def track_fixture(attrs \\ %{}) do
    user = Vamp.AccountsFixtures.user_fixture()
    song = song_fixture(user)

    {:ok, track} =
      attrs
      |> Enum.into(%{
        name: "some name",
        gain: 120.5,
        panning: 120.5,
        song_id: song.id
      })
      |> Vamp.Projects.create_track()

    track
  end

  @doc """
  Generate a audio_clip.
  """
  def audio_clip_fixture(attrs \\ %{}) do
    attributes =
      Enum.into(attrs, %{
        name: "some name",
        type: "some type",
        playback_rate: 120.5,
        track_id: track_fixture().id
      })

    {:ok, clip} =
      %Vamp.Projects.AudioClip{}
      |> Vamp.Projects.AudioClip.changeset(attributes)
      |> Vamp.Repo.insert()

    clip
  end

  def audio_file_fixture(attrs \\ %{}) do
    Map.merge(attrs, %Plug.Upload{
      filename: "100action.wav",
      path: "test/support/fixtures/samples/100action.wav",
      content_type: "audio/wav"
    })
  end
end
