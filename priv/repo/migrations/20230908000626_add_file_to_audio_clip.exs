defmodule Vamp.Repo.Migrations.AddFileToAudioClip do
  use Ecto.Migration

  def change do
    alter table("audio_clips") do
      add :audio_file, :string
    end
  end
end
