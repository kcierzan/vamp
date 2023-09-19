defmodule Vamp.Repo.Migrations.AddIndexToAudioClip do
  use Ecto.Migration

  def change do
    alter table(:audio_clips) do
      add(:index, :integer, null: false)
    end
  end
end
