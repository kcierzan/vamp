defmodule Vamp.Projects.AudioClip do
  use Ecto.Schema
  use Waffle.Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__, :track]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "audio_clips" do
    field :name, :string
    # TODO: drop `type` in favor of `media_type` on `audio_file` this
    field :type, :string
    field :playback_rate, :float
    field :index, :integer
    field :start_time, :float, default: 0.0
    field :end_time, :float
    belongs_to :audio_file, Vamp.Sounds.AudioFile
    belongs_to :track, Vamp.Projects.Track

    timestamps()
  end

  @doc false
  def changeset(audio_clip, attrs) do
    base_changeset(audio_clip, attrs) |> cast(attrs, [:track_id, :audio_file_id])
  end

  defp base_changeset(audio_clip, attrs) do
    audio_clip
    |> cast(attrs, [:name, :type, :playback_rate, :index, :start_time, :end_time])
    |> validate_required([:name, :type, :playback_rate, :index])
    |> assoc_constraint(:track)
    |> assoc_constraint(:audio_file)
  end
end
