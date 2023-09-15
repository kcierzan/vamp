defmodule Vamp.ProjectsFixtures do
  import Vamp.SoundsFixtures

  @moduledoc """
  This module defines test helpers for creating
  entities via the `Vamp.Projects` context.
  """

  @doc """
  Generate a song.
  """
  def song_fixture(attrs \\ %{}) do
    created_by_id =
      case attrs do
        %{created_by_id: created_by_id} ->
          created_by_id

        _ ->
          Vamp.AccountsFixtures.user_fixture().id
      end

    {:ok, song} =
      %{
        title: "some title",
        created_by_id: created_by_id
      }
      |> Enum.into(attrs)
      |> Vamp.Projects.create_song()

    song
  end

  @doc """
  Generate a track.
  """
  def track_fixture(attrs \\ %{}) do
    song_id =
      case attrs do
        %{song_id: song_id} ->
          song_id

        _ ->
          song_fixture().id
      end

    {:ok, track} =
      attrs
      |> Enum.into(%{
        name: "some name",
        gain: 120.5,
        panning: 120.5,
        song_id: song_id
      })
      |> Vamp.Projects.create_track()

    track
  end

  @doc """
  Generate a audio_clip.
  """
  def audio_clip_fixture(attrs \\ %{}) do
    track_id =
      case attrs do
        %{track_id: track_id} ->
          track_id

        _ ->
          track_fixture().id
      end

    attributes =
      Enum.into(
        %{
          name: "some name",
          type: "some type",
          playback_rate: 120.5,
          track_id: track_id,
          audio_file_id: audio_file_fixture().id
        },
        attrs
      )

    {:ok, clip} =
      %Vamp.Projects.AudioClip{}
      |> Vamp.Projects.AudioClip.changeset(attributes)
      |> Vamp.Repo.insert()

    clip
  end
end
