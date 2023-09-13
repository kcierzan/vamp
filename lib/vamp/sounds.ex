defmodule Vamp.Sounds do
  @moduledoc """
  The Sounds context.
  """

  import Ecto.Query, warn: false
  alias Vamp.Repo

  alias Vamp.Sounds.AudioFile

  @doc """
  Returns the list of audio_files.

  ## Examples

      iex> list_audio_files()
      [%AudioFile{}, ...]

  """
  def list_audio_files do
    Repo.all(AudioFile)
  end

  @doc """
  Gets a single audio_file.

  Raises `Ecto.NoResultsError` if the Audio file does not exist.

  ## Examples

      iex> get_audio_file!(123)
      %AudioFile{}

      iex> get_audio_file!(456)
      ** (Ecto.NoResultsError)

  """
  def get_audio_file!(id), do: Repo.get!(AudioFile, id)

  @doc """
  Creates a audio_file.

  ## Examples

      iex> create_audio_file(%{field: value})
      {:ok, %AudioFile{}}

      iex> create_audio_file(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_audio_file(attrs \\ %{}) do
    %AudioFile{}
    |> AudioFile.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a audio_file.

  ## Examples

      iex> update_audio_file(audio_file, %{field: new_value})
      {:ok, %AudioFile{}}

      iex> update_audio_file(audio_file, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_audio_file(%AudioFile{} = audio_file, attrs) do
    audio_file
    |> AudioFile.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a audio_file.

  ## Examples

      iex> delete_audio_file(audio_file)
      {:ok, %AudioFile{}}

      iex> delete_audio_file(audio_file)
      {:error, %Ecto.Changeset{}}

  """
  def delete_audio_file(%AudioFile{} = audio_file) do
    Repo.delete(audio_file)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking audio_file changes.

  ## Examples

      iex> change_audio_file(audio_file)
      %Ecto.Changeset{data: %AudioFile{}}

  """
  def change_audio_file(%AudioFile{} = audio_file, attrs \\ %{}) do
    AudioFile.changeset(audio_file, attrs)
  end
end
