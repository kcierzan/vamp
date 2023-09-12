defmodule Vamp.Projects.AudioClip do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :track]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "audio_clips" do
    field :name, :string
    field :type, :string
    field :playback_rate, :float
    field :audio_file, Vamp.AudioFile.Type
    belongs_to :track, Vamp.Projects.Track

    timestamps()
  end

  @doc false
  def changeset(audio_clip, attrs) do
    audio_clip
    |> cast(attrs, [:name, :type, :playback_rate, :track_id])
    |> cast_attachments(attrs, [:audio_file])
    |> validate_required([:name, :type, :playback_rate, :track_id])
    |> assoc_constraint(:track)
  end

  @doc false
  def audio_file_changeset(audio_clip, attrs) do
    audio_clip
    |> cast_attachments(attrs, [:audio_file])
    |> validate_required([:audio_file])
  end
end
