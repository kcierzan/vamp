defmodule Vamp.Repo.Migrations.CreateStartStopTimesOnAudioClip do
  use Ecto.Migration

  def change do
    alter table(:audio_clips) do
      add :start_time, :float, default: 0.0, null: false
      add :end_time, :float
    end
  end
end
