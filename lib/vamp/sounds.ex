defmodule Vamp.Sounds do
  @moduledoc """
  The Sounds context.
  """

  import Ecto.Query, warn: false
  alias Vamp.Repo

  alias Vamp.Sounds.AudioFile
  alias Vamp.Pools.PoolFile

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
  Creates an audio_file, associating it to the song via `PoolFile`,
  and optionally associating it to an existing `AudioClip`. A valid `song_id`
  in the attrs is required.
  """

  def create_pool_audio_file(attrs \\ %{}) do
    {:ok, record} =
      Repo.transaction(fn ->
        with {:ok, audio_file} <- create_audio_file(attrs),
             {:ok, _pool_file} <- create_pool_file(audio_file.id, Map.fetch!(attrs, "song_id")) do
          maybe_associate_clip(audio_file, attrs)
        else
          _ -> raise "failed to create audio file in pool"
        end
      end)

    record
  end

  defp maybe_associate_clip(audio_file, attrs) do
    if attrs["clip_id"] do
      Vamp.Projects.associate_audio_clip_audio_file!(attrs["clip_id"], audio_file.id)
    else
      audio_file |> Repo.preload(:audio_clips) |> add_url_to_audio_file()
    end
  end

  def add_url_to_audio_file(nil), do: nil

  def add_url_to_audio_file(audio_file) do
    put_in(audio_file.file[:url], Vamp.AudioFile.url(audio_file.file[:file_name], audio_file))
  end

  defp create_pool_file(audio_file_id, song_id) do
    %PoolFile{}
    |> PoolFile.changeset(%{"song_id" => song_id, "audio_file_id" => audio_file_id})
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
