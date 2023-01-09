import { Game, GameEvents } from "../src";
import { IGameConfig } from "../src/IGameConfig";
import { Player } from "../src/Player";
export interface IGameEventStashItem {
    event: GameEvents;
    data: any;
}
export type GameRunnerCallback = (data: any, players: Array<Player>, events: Array<IGameEventStashItem>) => void;
export declare class GameRunner {
    private readonly gameTimeout;
    static config: IGameConfig;
    events: Array<IGameEventStashItem>;
    game: Game;
    private originalTimerBetweenRounds;
    private playerStash;
    constructor(players: Array<Player>, gameTimeout?: number);
    play(): Promise<Array<IGameEventStashItem>>;
    onRoundStarted(cb: GameRunnerCallback): void;
    onPickStarted(cb: GameRunnerCallback): void;
    private listenEvents;
    private onEvent;
}
//# sourceMappingURL=GameRunner.d.ts.map