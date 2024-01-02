defmodule VampWeb.Feature.LandingPageTest do
  use ExUnit.Case, async: true
  use Wallaby.Feature

  feature "the homepage loads", %{session: session} do
    session
    |> visit("/")
    |> assert_has(Query.text_field("Name"))
    |> assert_has(Query.text_field("Email"))
    |> assert_has(Query.text_field("Password"))
  end
end
