defmodule Vamp.Repo.Migrations.CreateAudioClips do
  use Ecto.Migration

  def change do
    create table(:audio_clips) do
      add :name, :string
      add :type, :string
      add :playback_rate, :float
      add :track_id, references(:tracks, on_delete: :delete_all), null: false

      timestamps()
    end
  end
end
