defmodule Vamp.SoundsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Vamp.Sounds` context.
  """

  @doc """
  Generate a audio_file.
  """
  def audio_file_fixture(attrs \\ %{}) do
    {:ok, audio_file} =
      attrs
      |> Enum.into(%{
        name: "some name",
        size: 42,
        file: file_fixture(),
        description: "some description",
        media_type: "audio/wav"
      })
      |> Vamp.Sounds.create_audio_file()

    audio_file
  end

  defp file_fixture(attrs \\ %{}) do
    Map.merge(attrs, %Plug.Upload{
      filename: "100action.wav",
      path: "test/support/fixtures/samples/100action.wav",
      content_type: "audio/wav"
    })
  end
end
