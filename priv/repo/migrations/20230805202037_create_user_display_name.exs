defmodule Vamp.Repo.Migrations.CreateUserDisplayName do
  use Ecto.Migration

  def change do
    alter table("users") do
      add :display_name, :string
    end

    create unique_index(:users, [:display_name])
  end
end
