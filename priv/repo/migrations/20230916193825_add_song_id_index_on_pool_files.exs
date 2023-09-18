defmodule Vamp.Repo.Migrations.AddSongIdIndexOnPoolFiles do
  use Ecto.Migration
  @disable_ddl_transaction true

  def change do
    create index(:pool_files, [:song_id], concurrently: true)
    create unique_index(:pool_files, [:audio_file_id, :song_id], concurrently: true)
  end
end
