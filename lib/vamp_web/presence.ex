defmodule VampWeb.Presence do
  use Phoenix.Presence,
    otp_app: :vamp,
    pubsub_server: Vamp.PubSub
end
