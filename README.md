# Vamp

## Development Environment

Vamp requires the follwing be installed an accessible in `$PATH`:

1. Elixir (>= 1.15.4 / OTP 26)
2. Node (>= 20.7.0)
3. PostgreSQL (>= 14.9)

Vamp requires a superuser named "postgres" exist in Postgres. If on macOS, you can run the following to create the postgres user:

```bash
createuser --superuser --createdb postgres
```

Required versions of `Elixir` and `Node` can be installed via [rtx](https://github.com/jdx/rtx). If you have `rtx` installed, simply run:

```bash
$ cd vamp && rtx install
```

This will install required versions of Elixir, Node, and Erlang. Additional dependencies can then be installed via `mix`:

```bash
$ cd vamp && mix setup
```


To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
