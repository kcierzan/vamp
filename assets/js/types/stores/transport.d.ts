declare interface TransportStore {
  transport: typeof import("tone").Transport;
  state: PlayState;
}
