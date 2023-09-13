defmodule Vamp.Projects.Song do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}
  @primary_key {:id, Ecto.UUID, autogenerate: true}
  @foreign_key_type Ecto.UUID

  schema "songs" do
    field :description, :string
    field :title, :string
    field :bpm, :float, default: 120.0
    field :time_signature, :string, default: "4/4"
    belongs_to :created_by, Vamp.Accounts.User, foreign_key: :created_by_id
    has_many :tracks, Vamp.Projects.Track

    timestamps()
  end

  @doc false
  def changeset(song, attrs) do
    song
    |> cast(attrs, [:title, :description, :bpm, :time_signature, :created_by_id])
    |> validate_required([:title, :created_by_id])
    |> assoc_constraint(:created_by)
  end
end
