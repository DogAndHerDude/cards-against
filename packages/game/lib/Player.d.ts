import { IWhiteCard } from "./ICard";
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
    playCard(playedCards: string[]): void;
    pickCard(text: string[]): void;
    getCardPick(): string[] | undefined;
    getCardsInPlay(): string[] | undefined;
    clearCardsInPlay(): void;
    getPoints(): number;
    addPoint(): void;
}
//# sourceMappingURL=Player.d.ts.map