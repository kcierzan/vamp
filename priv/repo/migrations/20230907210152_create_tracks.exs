defmodule Vamp.Repo.Migrations.CreateTracks do
  use Ecto.Migration
  @disable_ddl_transaction true

  def change do
    create table(:tracks) do
      add :gain, :float
      add :panning, :float
      add :name, :string
      add :song_id, references(:songs, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:tracks, [:song_id], concurrently: true)
  end
end
