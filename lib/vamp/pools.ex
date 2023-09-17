defmodule Vamp.Pools do
  import Ecto.Query, warn: false
  alias Vamp.Repo
  alias Vamp.Pools.PoolFile

  def get_pool_for_song(user_id, song_id) do
    from(pool_files in PoolFile, as: :pool_file)
    |> join(:inner, [pool_file: pool_file], s in assoc(pool_file, :song), as: :song)
    |> preload([:song, :audio_file])
    |> where(
      [pool_file: pool_file, song: song],
      pool_file.song_id == ^song_id and song.created_by_id == ^user_id
    )
    |> select([:audio_file])
    |> Repo.all()
  end

  def add_file_to_pool!(audio_file_id, song_id) do
    %PoolFile{}
    |> Ecto.Changeset.change(audio_file_id: audio_file_id, song_id: song_id)
    |> PoolFile.changeset(%{})
    |> Repo.insert!()
  end
end
