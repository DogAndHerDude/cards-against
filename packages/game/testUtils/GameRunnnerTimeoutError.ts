import { IGameEventStashItem } from "./GameRunner";

export class GameRunnerTimeoutError extends Error {
  public events: Array<IGameEventStashItem["event"]> = [];

  constructor(
    timeout: number,
    public readonly eventsTrace: Array<IGameEventStashItem>
  ) {
    super(`GameRunner timed out after ${timeout}ms`);

    this.events = eventsTrace.map(({ event }) => event);
  }
}
