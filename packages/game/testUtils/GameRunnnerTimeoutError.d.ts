import { IGameEventStashItem } from "./GameRunner";
export declare class GameRunnerTimeoutError extends Error {
    readonly eventsTrace: Array<IGameEventStashItem>;
    events: Array<IGameEventStashItem["event"]>;
    constructor(timeout: number, eventsTrace: Array<IGameEventStashItem>);
}
//# sourceMappingURL=GameRunnnerTimeoutError.d.ts.map