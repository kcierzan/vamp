defmodule Vamp.Repo.Migrations.AddAudioFileIdToClip do
  use Ecto.Migration

  def change do
    alter table(:audio_clips) do
      add(:audio_file_id, references(:audio_files, on_delete: :nilify_all))
    end
  end
end
