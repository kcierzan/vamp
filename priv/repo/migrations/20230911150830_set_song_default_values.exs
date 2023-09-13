defmodule Vamp.Repo.Migrations.SetSongDefaultValues do
  use Ecto.Migration

  def change do
    alter table("songs") do
      modify :bpm, :float, default: 120.0, null: false
      modify :time_signature, :string, default: "4/4", null: false
    end
  end
end
