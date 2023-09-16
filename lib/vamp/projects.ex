defmodule Vamp.Projects do
  @moduledoc """
  The Projects context.
  """

  require Logger
  import Ecto.Query, warn: false
  alias Vamp.Repo

  alias Vamp.Projects.{Song, Track, AudioClip}

  def get_fixture_song() do
    Song |> first() |> Repo.one!()
  end

  @doc """
  Returns a full project for a user
  """
  def get_project!(user_id, song_id) do
    project_query(user_id, song_id)
    |> Repo.one!()
    |> add_audio_file_urls()
  end

  defp project_query(user_id, song_id) do
    from(song in Song, as: :song)
    |> preload([:created_by, tracks: [audio_clips: [:audio_file]]])
    |> where([song: song], song.id == ^song_id and song.created_by_id == ^user_id)
  end

  defp add_audio_file_urls(project) do
    update_in(
      project,
      [Access.key!(:tracks), Access.all()],
      fn track ->
        update_in(
          track,
          [Access.key(:audio_clips, []), Access.all(), Access.key(:audio_file)],
          &add_url_to_audio_file/1
        )
      end
    )
  end

  defp add_url_to_audio_file(nil), do: nil

  defp add_url_to_audio_file(audio_file) do
    put_in(audio_file.file[:url], Vamp.AudioFile.url(audio_file.file[:file_name], audio_file))
  end

  @doc """
  Returns the list of songs.

  ## Examples

      iex> list_songs()
      [%Song{}, ...]

  """
  def list_songs(user_id) do
    user_songs(user_id) |> Repo.all()
  end

  @doc """
  Gets a single song.

  Raises `Ecto.NoResultsError` if the Song does not exist.

  ## Examples

      iex> get_song!(123)
      %Song{}

      iex> get_song!(456)
      ** (Ecto.NoResultsError)

  """
  def get_song!(user_id, id) do
    user_songs(user_id) |> Repo.get!(id)
  end

  @doc """
  Creates a song.

  ## Examples

      iex> create_song(%{field: value})
      {:ok, %Song{}}

      iex> create_song(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_song(attrs \\ %{}) do
    %Song{}
    |> Song.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a song.

  ## Examples

      iex> update_song(song, %{field: new_value})
      {:ok, %Song{}}

      iex> update_song(song, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_song(%Song{} = song, attrs) do
    song
    |> Song.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a song.

  ## Examples

      iex> delete_song(song)
      {:ok, %Song{}}

      iex> delete_song(song)
      {:error, %Ecto.Changeset{}}

  """
  def delete_song(%Song{} = song) do
    Repo.delete(song)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking song changes.

  ## Examples

      iex> change_song(song)
      %Ecto.Changeset{data: %Song{}}

  """
  def change_song(%Song{} = song, attrs \\ %{}) do
    Song.changeset(song, attrs)
  end

  defp user_songs(user_id) do
    from(s in Song, where: s.created_by_id == ^user_id)
  end

  alias Vamp.Projects.Track

  @doc """
  Returns the list of tracks.

  ## Examples

      iex> list_tracks()
      [%Track{}, ...]

  """
  def list_tracks do
    Repo.all(Track)
  end

  @doc """
  Gets a single track.

  Raises `Ecto.NoResultsError` if the Track does not exist.

  ## Examples

      iex> get_track!(123)
      %Track{}

      iex> get_track!(456)
      ** (Ecto.NoResultsError)

  """
  def get_track!(id), do: Repo.get!(Track, id)

  @doc """
  Creates a track.

  ## Examples

      iex> create_track(%{field: value})
      {:ok, %Track{}}

      iex> create_track(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_track(attrs \\ %{}) do
    %Track{}
    |> Track.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a track.

  ## Examples

      iex> update_track(track, %{field: new_value})
      {:ok, %Track{}}

      iex> update_track(track, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_track(%Track{} = track, attrs) do
    track
    |> Track.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a track.

  ## Examples

      iex> delete_track(track)
      {:ok, %Track{}}

      iex> delete_track(track)
      {:error, %Ecto.Changeset{}}

  """
  def delete_track(%Track{} = track) do
    Repo.delete(track)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking track changes.

  ## Examples

      iex> change_track(track)
      %Ecto.Changeset{data: %Track{}}

  """
  def change_track(%Track{} = track, attrs \\ %{}) do
    Track.changeset(track, attrs)
  end

  alias Vamp.Projects.AudioClip

  @doc """
  Returns the list of audio_clips.

  ## Examples

      iex> list_audio_clips()
      [%AudioClip{}, ...]

  """
  def list_audio_clips do
    Repo.all(AudioClip)
  end

  @doc """
  Gets a single audio_clip.

  Raises `Ecto.NoResultsError` if the Audio clip does not exist.

  ## Examples

      iex> get_audio_clip!(123)
      %AudioClip{}

      iex> get_audio_clip!(456)
      ** (Ecto.NoResultsError)

  """
  def get_audio_clip!(id) do
    from(ac in AudioClip, as: :audio_clip)
    |> preload(:audio_file)
    |> where([audio_clip: audio_clip], audio_clip.id == ^id)
    |> Repo.one!()
  end

  @doc """
  Creates a audio_clip.

  ## Examples

      iex> create_audio_clip(%{field: value})
      {:ok, %AudioClip{}}

      iex> create_audio_clip(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_audio_clip(attrs \\ %{}) do
    %AudioClip{}
    |> AudioClip.changeset(attrs)
    |> Repo.insert()
  end

  def create_file_for_clip!(attrs \\ %{}) do
    audio_file_attrs = Vamp.Sounds.AudioFile.changeset(%Vamp.Sounds.AudioFile{}, attrs)

    get_audio_clip!(attrs["clip_id"])
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:audio_file, audio_file_attrs)
    |> Repo.update!()
    |> add_url_to_audio_clip()

  end

  defp add_url_to_audio_clip(audio_clip) do
    put_in(audio_clip.audio_file, add_url_to_audio_file(audio_clip.audio_file))
  end

  @doc """
  Updates a audio_clip.

  ## Examples

      iex> update_audio_clip(audio_clip, %{field: new_value})
      {:ok, %AudioClip{}}

      iex> update_audio_clip(audio_clip, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_audio_clip(%AudioClip{} = audio_clip, attrs) do
    audio_clip
    |> AudioClip.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a audio_clip.

  ## Examples

      iex> delete_audio_clip(audio_clip)
      {:ok, %AudioClip{}}

      iex> delete_audio_clip(audio_clip)
      {:error, %Ecto.Changeset{}}

  """
  def delete_audio_clip(%AudioClip{} = audio_clip) do
    Repo.delete(audio_clip)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking audio_clip changes.

  ## Examples

      iex> change_audio_clip(audio_clip)
      %Ecto.Changeset{data: %AudioClip{}}

  """
  def change_audio_clip(%AudioClip{} = audio_clip, attrs \\ %{}) do
    AudioClip.changeset(audio_clip, attrs)
  end
end