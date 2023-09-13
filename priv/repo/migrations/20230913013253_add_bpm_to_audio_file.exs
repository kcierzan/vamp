defmodule Vamp.Repo.Migrations.AddBpmToAudioFile do
  use Ecto.Migration

  def change do
    alter table(:audio_files) do
      add :bpm, :float
    end
  end
end
