import { IWhiteCard } from "./ICard";
import { CardNotFoundError } from "./errors/CardNotFoundError";
import { IPlainPlayer } from "./IPlainPlayer";

export class Player {
  private cardsInPlay?: string[];
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

  public playCard(text: string[]) {
    const cards = this.cards.filter((card) => text.includes(card.text));

    if (!cards.length) {
      throw new CardNotFoundError();
    }

    this.cardsInPlay = cards.map((card) => card.text);
  }

  public pickCard(text: string[]) {
    this.cardPick = text;
  }

  public getCardPick() {
    return this.cardPick;
  }

  public getCardInPlay() {
    return this.cardsInPlay;
  }

  public clearCardInPlay() {
    if (!this.cardsInPlay) {
      // TODO: throw error no card in play
    }

    // this.playedCards = [...this.playedCards, this.cardInPlay];
    this.cards = this.cards.filter((card) =>
      this.cardsInPlay?.includes(card.text)
    );
    this.cardsInPlay = undefined;
  }

  public getPoints() {
    return this.points;
  }

  public addPoint() {
    this.points += 1;
  }

  // TODO: Refactor this shit to instanceToPlain
  public toPlain(): IPlainPlayer {
    return {
      id: this.id,
      points: this.points,
    };
  }
}
