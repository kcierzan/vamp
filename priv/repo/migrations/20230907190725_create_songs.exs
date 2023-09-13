defmodule Vamp.Repo.Migrations.CreateSongs do
  use Ecto.Migration
  @disable_ddl_transaction true

  def change do
    create table(:songs) do
      add :title, :string
      add :description, :string
      add :bpm, :float
      add :time_signature, :string
      add :created_by, references(:users, on_delete: :nilify_all), null: false

      timestamps()
    end

    create index(:songs, [:created_by], concurrently: true)
  end
end
