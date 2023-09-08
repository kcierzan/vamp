defmodule Vamp.Repo.Migrations.SetCreatedByIdToNullable do
  use Ecto.Migration

  def change do
    alter table("songs") do
      modify :created_by_id, references(:users, on_delete: :nilify_all),
        null: true,
        from: {references(:users, on_delete: :nilify_all), null: false}
    end
  end
end
