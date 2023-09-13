defmodule Vamp.Projects.AudioClip do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :track]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "audio_clips" do
    field :name, :string
    field :type, :string
    field :playback_rate, :float
    belongs_to :audio_file, Vamp.Sounds.AudioFile
    belongs_to :track, Vamp.Projects.Track

    timestamps()
  end

  @doc false
  def changeset(audio_clip, attrs) do
    audio_clip
    |> cast(attrs, [:name, :type, :playback_rate, :track_id, :audio_file_id])
    |> validate_required([:name, :type, :playback_rate, :track_id, :audio_file_id])
    |> assoc_constraint(:track)
    |> assoc_constraint(:audio_file)
  end
end
