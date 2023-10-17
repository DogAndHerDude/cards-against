import { IWhiteCard } from "./ICard";
import { CardNotFoundError } from "./errors/CardNotFoundError";

export class Player {
  private cardsInPlay?: IWhiteCard[];
  private cardPick?: string[];
  private cards: Array<IWhiteCard> = [];
  private playedCards: Array<IWhiteCard> = [];
  private points = 0;

  constructor(public readonly id: string) {}

  public getCards(): Array<IWhiteCard> {
    return this.cards;
  }

  public addCards(cards: Array<IWhiteCard>) {
    this.cards = [...this.cards, ...cards];
  }

  public playCard(playedCards: string[]) {
    this.cardsInPlay = this.cards.filter((card) =>
      playedCards.includes(card.text),
    );

    if (!this.cardsInPlay.length) {
      throw new CardNotFoundError();
    }

    this.cards = this.cards.filter((card) => !playedCards.includes(card.text));
  }

  public pickCard(text: string[]) {
    this.cardPick = text;
  }

  public getCardPick() {
    return this.cardPick;
  }

  public getCardsInPlay() {
    return this.cardsInPlay?.map((card) => card.text);
  }

  public clearCardsInPlay() {
    this.cardsInPlay = undefined;
  }

  public getPoints() {
    return this.points;
  }

  public addPoint() {
    this.points += 1;
  }
}
