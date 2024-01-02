# Vamp

## Development Environment

Vamp requires the follwing be installed and accessible in `$PATH`:

1. elixir (>= 1.15.4 / OTP 26)
2. node (>= 20.7.0)
3. postgreSQL (>= 14.9)

Vamp requires postgres to have a superuser named "postgres". If you have postgres installed, you likely have `createuser` in your `$PATH`.
Run the following to create the postgres user:

```sh
$ mix db.user
```

Required versions of `elixir` and `node` can be installed via [rtx](https://github.com/jdx/rtx). 
If you have `rtx` installed, run the following from the project root.

```sh
$ rtx install
```

Once `elixir` is installed, additional dependencies can then be installed via `mix`:

```sh
$ mix setup
```

To start the Phoenix server:

  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

### Development Credentials

To log in to the application in the development environment, use the following credentials:

| Email address    | Password        |
|------------------|-----------------|
| test@example.com | testingpassword |


## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
