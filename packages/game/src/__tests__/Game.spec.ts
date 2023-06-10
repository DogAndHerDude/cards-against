import { GameEvents } from "../GameEvents";
import { Player } from "../Player";
import { GameRunner } from "../../testUtils/GameRunner";
import { RoundStartedPayload } from "../payloads/RoundStartedPayload";
import { CardService, Game, GameDeck } from "..";
import { TooFewPlayersError } from "../errors/TooFewPlayersError";

describe("Game", () => {
  describe("Base game", () => {
    it("Should start the game, hands out cards, notifies of round start, and lets you play a basic game allowing for each player to play once", async () => {
      const playerSetup = [new Player("0"), new Player("1")];
      const gameRunner = new GameRunner(playerSetup);
      const expectedEvents = [
        GameEvents.GAME_STARTED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.PLAYER_CARD_PLAYED,
        GameEvents.PLAY_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.ROUND_ENDED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.PLAYER_CARD_PLAYED,
        GameEvents.PLAY_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.ROUND_ENDED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.PLAYER_CARD_PLAYED,
        GameEvents.PLAY_ENDED,
        GameEvents.PICK_STARTED,
        GameEvents.PICK_ENDED,
        GameEvents.GAME_ENDED,
      ];

      gameRunner.onRoundStarted((data: RoundStartedPayload, players) => {
        const regularPlayer = players.find(({ id }) => id !== data.cardCzar);

        if (!regularPlayer) {
          throw new Error("Could not find a player for this round");
        }

        const cardsToPlay = new Array(data.blackCard.pick)
          .fill(null)
          .map((_, index) => regularPlayer.getCards()[index].text);

        gameRunner.game.playCard(regularPlayer.id, cardsToPlay);
      });
      gameRunner.onPickStarted((_, players) => {
        const czar = players.find((player) => !player.getCardsInPlay()?.length);
        const player = players.find(
          (player) => !!player.getCardsInPlay()?.length
        );

        if (!czar) {
          throw new Error("Could not find czar for this round");
        }

        if (!player) {
          throw new Error("Could not find player to pick this round");
        }

        if (!player.getCardsInPlay()) {
          throw new Error("Player does not have a card in play");
        }

        gameRunner.game.pickCards(czar.id, player.getCardsInPlay() as string[]);
      });

      const emittedEvents = await gameRunner.play();

      expect(emittedEvents.map(({ event }) => event)).toStrictEqual(
        expectedEvents
      );
      // Check for card czar for each round
      // Check for card picks
      // Check for cards played
      emittedEvents
        .filter(({ event }) => event === GameEvents.HAND_OUT_CARDS)
        .forEach((event) => {
          expect(Object.keys(event.data)).toStrictEqual([
            playerSetup[0].id,
            playerSetup[1].id,
          ]);
          expect(event.data[playerSetup[0].id]).toHaveLength(6);
          expect(event.data[playerSetup[1].id]).toHaveLength(6);
        });
    });

    it("Should throw an error when starting a game with too few players", () => {
      try {
        const cardService = new CardService();
        const deck = new GameDeck(cardService.getDeck(GameRunner.config.packs));
        new Game([], GameRunner.config, deck);
      } catch (error) {
        expect(error).toBeInstanceOf(TooFewPlayersError);
      }
    });

    it("Should switch to new cardCzar when the current one leaves and stop game when too few players", async () => {
      const expectedEvents = [
        GameEvents.GAME_STARTED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.ROUND_ENDED,
        GameEvents.HAND_OUT_CARDS,
        GameEvents.ROUND_STARTED,
        GameEvents.GAME_ENDED,
      ];
      const playerSetup = [new Player("0"), new Player("1"), new Player("2")];
      const gameRunner = new GameRunner(playerSetup);

      gameRunner.onRoundStarted((data: RoundStartedPayload, players) => {
        const cardCzar = players.find(({ id }) => data.cardCzar === id);

        if (!cardCzar) {
          throw new Error("Could not find a cardCzar for this round");
        }

        gameRunner.game.removePlayer(cardCzar.id);
      });

      const emittedEvents = await gameRunner.play();

      expect(emittedEvents.map(({ event }) => event)).toStrictEqual(
        expectedEvents
      );
      expect(
        emittedEvents
          .filter(({ event }) => event === GameEvents.ROUND_STARTED)
          .map(({ data }) => data.cardCzar)
      ).toStrictEqual([playerSetup[0].id, playerSetup[1].id]);
    });
  });

  it("Should set a new nextCzar when current nextCzar leaves", async () => {
    const expectedEvents = [
      GameEvents.GAME_STARTED,
      GameEvents.HAND_OUT_CARDS,
      GameEvents.ROUND_STARTED,
      GameEvents.PLAYER_CARD_PLAYED,
      GameEvents.PLAY_ENDED,
      GameEvents.PICK_STARTED,
      GameEvents.PICK_ENDED,
      GameEvents.ROUND_ENDED,
      GameEvents.HAND_OUT_CARDS,
      GameEvents.ROUND_STARTED,
      GameEvents.GAME_ENDED,
    ];
    const playerSetup = [new Player("0"), new Player("1"), new Player("2")];
    const gameRunner = new GameRunner(playerSetup);

    gameRunner.onRoundStarted((data: RoundStartedPayload, players) => {
      const nextCardCzar = players.find(
        ({ id }) => gameRunner.game.getNextCardCzar() === id
      );

      if (!nextCardCzar) {
        throw new Error("Could not find a nextCardCzar for this round");
      }

      gameRunner.game.removePlayer(nextCardCzar.id);

      // Get new list of players
      // Since the one passed isn't mutated after removal
      const player = gameRunner.game
        .getPlayers()
        .find(({ id }) => id !== data.cardCzar);

      if (!player) {
        return;
      }

      const cardsToPlay = new Array(data.blackCard.pick)
        .fill(null)
        .map((_, index) => player.getCards()[index].text);

      gameRunner.game.playCard(player.id, cardsToPlay);
    });
    gameRunner.onPickStarted((_, players) => {
      const czar = players.find((player) => !player.getCardsInPlay()?.length);
      const player = players.find(
        (player) => !!player.getCardsInPlay()?.length
      );

      if (!czar) {
        throw new Error("Could not find czar for this round");
      }

      if (!player) {
        throw new Error("Could not find player to pick this round");
      }

      if (!player.getCardsInPlay()) {
        throw new Error("Player does not have a card in play");
      }

      gameRunner.game.pickCards(czar.id, player.getCardsInPlay() as string[]);
    });

    const emittedEvents = await gameRunner.play();

    expect(emittedEvents.map(({ event }) => event)).toStrictEqual(
      expectedEvents
    );
    expect(
      emittedEvents
        .filter(({ event }) => event === GameEvents.ROUND_STARTED)
        .map(({ data }) => data.cardCzar)
    ).toStrictEqual([playerSetup[0].id, playerSetup[2].id]);
  });
  // test no card picked
});
