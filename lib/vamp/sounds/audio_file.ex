defmodule Vamp.Sounds.AudioFile do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :audio_clips]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "audio_files" do
    field :name, :string
    field :size, :integer
    field :file, Vamp.AudioFile.Type
    field :description, :string
    field :media_type, :string
    field :bpm, :float
    has_many :audio_clips, Vamp.Projects.AudioClip

    timestamps()
  end

  @doc false
  def changeset(audio_file, attrs) do
    audio_file
    |> cast(attrs, [:media_type, :size, :name, :description, :bpm])
    |> cast_attachments(attrs, [:file])
    |> validate_required([:media_type, :size, :name, :description, :file])
  end
end
