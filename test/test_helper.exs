ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Vamp.Repo, :manual)
{:ok, _} = Application.ensure_all_started(:wallaby)
