# TODO

- [x] Add clip start/stop editing
    - Handling clip editor state
    - state of the editor / wavesurfer
        - create a new wavesurfer instance in a reactive call?
    - add start/stop points to clip data model
    - add messages to update clip start/stop points
    - on receive message w/ updated clip start/stop -> copy times to players store
    - pass offset and duration args to grainplayer .start() method

- [x] Create pitch-shifter AudioWorkletProcessor based on [phaze](https://github.com/olvb/phaze)
    - Use ToneBufferSource + Custom AWP
    - SOMEDAY: write the worker in Rust and compile to WASM

- [x] Create clip progress indicator
- [ ] Create UI to adjust loop length independent of clip length
- [ ] Add volume faders
- [ ] Add panning knobs
- [ ] Make latency cache per-song-session (Registry)
- [ ] Add validations to Ecto changesets
- [ ] Improve error handling in DB access + channel code
- [ ] Namespace channels to a song

