defmodule Vamp.Repo.Migrations.AddAudioFileIndexOnClips do
  use Ecto.Migration
  @disable_ddl_transaction true

  def change do
    create index(:audio_clips, [:audio_file_id], concurrently: true)
  end
end
