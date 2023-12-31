import Config

# Only in tests, remove the complexity from the password hashing algorithm
config :bcrypt_elixir, :log_rounds, 1

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :vamp, Vamp.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "vamp_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10,
  migration_lock: :pg_advisory_lock,
  migration_advisory_lock_max_tries: 10

# We don't run a server during test. If one is required,
# you can enable the server option below.
# N.B - ENABLED FOR WALLABY!
config :vamp, VampWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "V2u04++vrxhVzT8hwyuc+h0iAffUTKfnweMNvfjm18y3trjENFiDYuv/SH6u3qAT",
  server: true

# In test we don't send emails.
config :vamp, Vamp.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Create local filesystem storage provider for audio files
config :waffle, storage: Waffle.Storage.Local, asset_host: "http://localhost:4000"

config :vamp, serve_local_files: true

config :vamp, :sandbox, Ecto.Adapters.SQL.Sandbox
config :wallaby, driver: Wallaby.Selenium
config :wallaby, otp_app: :vamp
