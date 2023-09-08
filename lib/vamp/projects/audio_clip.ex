defmodule Vamp.Projects.AudioClip do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

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
    |> cast(attrs, [:name, :type, :playback_rate])
    |> cast_attachments(attrs, [:audio_file])
    |> validate_required([:name, :type, :playback_rate, :audio_file])
  end
end
