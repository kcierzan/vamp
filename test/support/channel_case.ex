defmodule VampWeb.ChannelCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      import Phoenix.ChannelTest
      import VampWeb.ChannelCase

      @endpoint VampWeb.Endpoint
    end
  end

  setup tags do
    Vamp.DataCase.setup_sandbox(tags)
    :ok
  end
end
