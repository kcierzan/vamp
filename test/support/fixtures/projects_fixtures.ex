defmodule Vamp.ProjectsFixtures do
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
      |> Enum.into(%{
        description: "some description",
        title: "some title",
        bpm: 120.5,
        time_signature: "some time_signature"
      })
      |> Vamp.Projects.create_song()

    song
  end

  @doc """
  Generate a track.
  """
  def track_fixture(attrs \\ %{}) do
    {:ok, track} =
      attrs
      |> Enum.into(%{
        name: "some name",
        gain: 120.5,
        panning: 120.5
      })
      |> Vamp.Projects.create_track()

    track
  end

  @doc """
  Generate a audio_clip.
  """
  def audio_clip_fixture(attrs \\ %{}) do
    {:ok, audio_clip} =
      attrs
      |> Enum.into(%{
        name: "some name",
        type: "some type",
        playback_rate: 120.5
      })
      |> Vamp.Projects.create_audio_clip()

    audio_clip
  end
end
