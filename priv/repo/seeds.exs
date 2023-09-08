# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Vamp.Repo.insert!(%Vamp.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
require Logger
alias Vamp.Repo
alias Vamp.Accounts.User

track_attrs = %{
  name: "test track",
  gain: 1.0,
  panning: 0.0
}

song_attrs = %{
  title: "test song",
  description: "test description",
  time_signature: "4/4",
  bpm: 128.0
}

user_attrs = %{
  email: "test@example.com",
  display_name: "test",
  password: "testingpassword"
}

audio_file = %Plug.Upload{filename: "100action.wav", path: "test/support/fixtures/samples/100action.wav", content_type: "audio/wav"}

clip_attrs = %{
  name: "action",
  type: "audio/wav",
  playback_rate: 1.0,
}

user =
  %User{}
  |> User.registration_changeset(user_attrs)
  |> Repo.insert!()

Logger.info("Created user ID: #{user.id}")

song =
  user
  |> Ecto.build_assoc(:songs, song_attrs)
  |> Repo.insert!()

Logger.info("Created song ID: #{song.id}")

track =
  song
  |> Ecto.build_assoc(:tracks, track_attrs)
  |> Repo.insert!()

Logger.info("Created track ID: #{track.id}")

clip =
  track
  |> Ecto.build_assoc(:audio_clips, clip_attrs)
  |> Ecto.Changeset.change()
  |> Vamp.Projects.AudioClip.changeset(%{audio_file: audio_file})
  |> Repo.insert!()

Logger.info("Created clip ID: #{clip.id}")
