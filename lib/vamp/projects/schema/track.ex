defmodule Vamp.Projects.Track do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :song]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "tracks" do
    field :name, :string
    field :gain, :float
    field :panning, :float
    belongs_to :song, Vamp.Projects.Song
    has_many :audio_clips, Vamp.Projects.AudioClip

    timestamps()
  end

  @doc false
  def changeset(track, attrs) do
    track
    |> cast(attrs, [:gain, :panning, :name, :song_id])
    |> cast_assoc(:audio_clips)
    |> validate_required([:gain, :panning, :name, :song_id])
    |> assoc_constraint(:song)
  end
end
