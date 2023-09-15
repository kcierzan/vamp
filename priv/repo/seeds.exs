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

audio_clip_attrs = %{
  name: "action",
  type: "audio/wav",
  playback_rate: 1.28
}

audio_file_attrs = %{
  name: "action break",
  size: 100,
  description: "a boring break",
  media_type: "audio/wav",
  bpm: 100,
  file: %Plug.Upload{
    filename: "100action.wav",
    path: "test/support/fixtures/samples/100action.wav",
    content_type: "audio/wav"
  }
}

user =
  %User{}
  |> User.registration_changeset(user_attrs)
  |> Repo.insert!()

Logger.info("Created user ID: #{user.id}")

song =
  %Vamp.Projects.Song{}
  |> Ecto.Changeset.change(created_by_id: user.id)
  |> Vamp.Projects.Song.changeset(song_attrs)
  |> Repo.insert!()

Logger.info("Created song ID: #{song.id}")

track =
  %Vamp.Projects.Track{}
  |> Ecto.Changeset.change(song_id: song.id)
  |> Vamp.Projects.Track.changeset(track_attrs)
  |> Repo.insert!()

Logger.info("Created track ID: #{track.id}")

audio_file =
  %Vamp.Sounds.AudioFile{}
  |> Vamp.Sounds.AudioFile.changeset(audio_file_attrs)
  |> Repo.insert!()

clip =
  %Vamp.Projects.AudioClip{}
  |> Ecto.Changeset.change(track_id: track.id, audio_file_id: audio_file.id)
  |> Vamp.Projects.AudioClip.changeset(audio_clip_attrs)
  |> Repo.insert!()

Logger.info("Created clip ID: #{clip.id}")
