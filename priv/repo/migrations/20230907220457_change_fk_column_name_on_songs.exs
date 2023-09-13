defmodule Vamp.Repo.Migrations.ChangeFkColumnNameOnSongs do
  use Ecto.Migration

  def change do
    rename table("songs"), :created_by, to: :created_by_id
  end
end
