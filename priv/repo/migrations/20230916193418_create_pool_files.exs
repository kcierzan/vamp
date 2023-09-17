defmodule Vamp.Repo.Migrations.CreatePoolFiles do
  use Ecto.Migration

  def change do
    create table(:pool_files) do
      add :song_id, references(:songs, on_delete: :delete_all), null: false
      add :audio_file_id, references(:audio_files, on_delete: :nilify_all)

      timestamps()
    end
  end
end
