defmodule Vamp.Repo.Migrations.DeleteAudioFileColumnOnClip do
  use Ecto.Migration

  def change do
    alter table(:audio_clips) do
      remove :audio_file, :string
    end
  end
end
