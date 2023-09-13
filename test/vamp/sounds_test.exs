defmodule Vamp.SoundsTest do
  use Vamp.DataCase

  alias Vamp.Sounds

  describe "audio_files" do
    alias Vamp.Sounds.AudioFile

    import Vamp.SoundsFixtures

    @invalid_attrs %{name: nil, size: nil, file: nil, description: nil, media_type: nil}

    test "list_audio_files/0 returns all audio_files" do
      audio_file = audio_file_fixture()
      assert Sounds.list_audio_files() == [audio_file]
    end

    test "get_audio_file!/1 returns the audio_file with given id" do
      audio_file = audio_file_fixture()
      assert Sounds.get_audio_file!(audio_file.id) == audio_file
    end

    test "create_audio_file/1 with valid data creates a audio_file" do
      file = %Plug.Upload{
        filename: "100action.wav",
        path: "test/support/fixtures/samples/100action.wav",
        content_type: "audio/wav"
      }

      valid_attrs = %{
        name: "some name",
        size: 42,
        file: file,
        description: "some description",
        media_type: "audio/wav"
      }

      assert {:ok, %AudioFile{} = audio_file} = Sounds.create_audio_file(valid_attrs)
      assert audio_file.name == "some name"
      assert audio_file.size == 42
      assert audio_file.file[:file_name] == "100action.wav"
      assert audio_file.description == "some description"
      assert audio_file.media_type == "audio/wav"
    end

    test "create_audio_file/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Sounds.create_audio_file(@invalid_attrs)
    end

    test "update_audio_file/2 with valid data updates the audio_file" do
      audio_file = audio_file_fixture()

      new_file = %Plug.Upload{
        filename: "Beastie Boys - Pow.wav",
        path: "test/support/fixtures/samples/Beastie Boys - Pow.wav",
        content_type: "audio/wav"
      }

      update_attrs = %{
        name: "some updated name",
        size: 43,
        file: new_file,
        description: "some updated description",
        media_type: "some updated media_type"
      }

      assert {:ok, %AudioFile{} = audio_file} = Sounds.update_audio_file(audio_file, update_attrs)
      assert audio_file.name == "some updated name"
      assert audio_file.size == 43
      assert audio_file.file[:file_name] == "Beastie Boys - Pow.wav"
      assert audio_file.description == "some updated description"
      assert audio_file.media_type == "some updated media_type"
    end

    test "update_audio_file/2 with invalid data returns error changeset" do
      audio_file = audio_file_fixture()
      assert {:error, %Ecto.Changeset{}} = Sounds.update_audio_file(audio_file, @invalid_attrs)
      assert audio_file == Sounds.get_audio_file!(audio_file.id)
    end

    test "delete_audio_file/1 deletes the audio_file" do
      audio_file = audio_file_fixture()
      assert {:ok, %AudioFile{}} = Sounds.delete_audio_file(audio_file)
      assert_raise Ecto.NoResultsError, fn -> Sounds.get_audio_file!(audio_file.id) end
    end

    test "change_audio_file/1 returns a audio_file changeset" do
      audio_file = audio_file_fixture()
      assert %Ecto.Changeset{} = Sounds.change_audio_file(audio_file)
    end
  end
end
