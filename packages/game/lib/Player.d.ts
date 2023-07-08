import { IWhiteCard } from "./ICard";
import { IPlainPlayer } from "./IPlainPlayer";
export declare class Player {
    readonly id: string;
    private cardsInPlay?;
    private cardPick?;
    private cards;
    private playedCards;
    private points;
    constructor(id: string);
    getCards(): Array<IWhiteCard>;
    addCards(cards: Array<IWhiteCard>): void;
    playCard(text: string[]): void;
    pickCard(text: string[]): void;
    getCardPick(): string[] | undefined;
    getCardsInPlay(): string[] | undefined;
    clearCardsInPlay(): void;
    getPoints(): number;
    addPoint(): void;
    toPlain(): IPlainPlayer;
}
//# sourceMappingURL=Player.d.ts.map