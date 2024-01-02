ExUnit.start()
Application.put_env(:wallaby, :base_url, VampWeb.Endpoint.url())
Ecto.Adapters.SQL.Sandbox.mode(Vamp.Repo, :manual)
{:ok, _} = Application.ensure_all_started(:wallaby)
