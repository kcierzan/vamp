defmodule Vamp.Repo.Migrations.CreateTrackIndexOnAudioClips do
  use Ecto.Migration
  @disable_ddl_transaction true

  def change do
    create index(:audio_clips, [:track_id], concurrently: true)
  end
end
