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
    {:ok, song} =
      attrs
      |> ensure_created_by_id()
      |> Enum.into(%{title: "some title"})
      |> Vamp.Projects.create_song()

    song
  end

  @doc """
  Generate a track.
  """
  def track_fixture(attrs \\ %{}) do
    attrs
    |> ensure_song_id()
    |> Enum.into(%{
      name: "some name",
      gain: 120.5,
      panning: 120.5
    })
    |> Vamp.Projects.create_track!()
  end

  @doc """
  Generate a audio_clip.
  """
  def audio_clip_fixture(attrs \\ %{}) do
    attributes =
      attrs
      |> ensure_track_id()
      |> Enum.into(%{
        name: "some name",
        type: "some type",
        playback_rate: 120.5,
        index: 0,
        audio_file_id: audio_file_fixture().id
      })

    {:ok, clip} =
      %Vamp.Projects.AudioClip{}
      |> Vamp.Projects.AudioClip.changeset(attributes)
      |> Vamp.Repo.insert()

    clip
  end

  defp ensure_track_id(attrs) do
    case attrs do
      %{track_id: _track_id} ->
        attrs

      _ ->
        put_in(attrs[:track_id], track_fixture().id)
    end
  end

  defp ensure_song_id(attrs) do
    case attrs do
      %{song_id: _song_id} ->
        attrs

      _ ->
        put_in(attrs[:song_id], song_fixture().id)
    end
  end

  defp ensure_created_by_id(attrs) do
    case attrs do
      %{created_by_id: _created_by_id} ->
        attrs

      _ ->
        put_in(attrs[:created_by_id], Vamp.AccountsFixtures.user_fixture().id)
    end
  end
end
