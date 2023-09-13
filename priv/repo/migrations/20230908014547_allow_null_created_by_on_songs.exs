defmodule Vamp.Repo.Migrations.AllowNullCreatedByOnSongs do
  use Ecto.Migration

  def change do
    drop constraint(:songs, "songs_created_by_fkey")
  end
end
