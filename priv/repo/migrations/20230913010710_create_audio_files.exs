defmodule Vamp.Repo.Migrations.CreateAudioFiles do
  use Ecto.Migration

  def change do
    create table(:audio_files) do
      add :name, :string, null: false
      add :description, :text
      add :media_type, :string, null: false
      add :size, :integer, null: false
      add :file, :string, null: false

      timestamps()
    end
  end
end
