import { IBlackCard, IWhiteCard } from "./ICard";
import { IPack } from "./IPack";
export declare class GameDeck {
    private whiteCards;
    private blackCards;
    constructor(deck: Array<IPack>);
    getWhiteCards(count: number): IWhiteCard[];
    getBlackCard(): IBlackCard | undefined;
    listWhiteCards(): IWhiteCard[];
    listBlackCards(): IBlackCard[];
    private mapWhiteCards;
    private mapBlackCards;
}
//# sourceMappingURL=GameDeck.d.ts.map