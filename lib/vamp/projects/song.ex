defmodule Vamp.Projects.Song do
  use Ecto.Schema
  import Ecto.Changeset

  schema "songs" do
    field :description, :string
    field :title, :string
    field :bpm, :float
    field :time_signature, :string
    belongs_to :created_by, Vamp.Accounts.User, foreign_key: :created_by_id
    has_many :tracks, Vamp.Projects.Track

    timestamps()
  end

  @doc false
  def changeset(song, attrs) do
    song
    |> cast(attrs, [:title, :description, :bpm, :time_signature, :created_by])
    |> validate_required([:title, :bpm, :time_signature, :created_by])
  end
end
