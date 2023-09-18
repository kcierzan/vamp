defmodule Vamp.Pools.PoolFile do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "pool_files" do
    belongs_to :song, Vamp.Projects.Song
    belongs_to :audio_file, Vamp.Sounds.AudioFile

    timestamps()
  end

  @doc false
  def changeset(pool_file, attrs) do
    pool_file
    |> assoc_constraint(:song)
    |> assoc_constraint(:audio_file)
    |> cast(attrs, [:song_id, :audio_file_id])
    |> validate_required([:song_id])
  end
end
