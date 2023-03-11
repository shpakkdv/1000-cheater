import { EmojiBySuit, RANKS, RankValue, SUITS, SuitValue } from "const";
import type { ChosenCards, Suit } from "types";
import { wrapEmoji } from "utils";

export function calculateChosenCardsNumber(chosenCards: ChosenCards): number {
  let count = 0;

  // h -> s
  for (let i = 0; i < SUITS.length; i++) {
    // 9 -> A
    for (let j = 0; j < RANKS.length; j++) {
      const suit = SUITS[i];
      const rank = RANKS[j];
      const card = `${rank}${suit}` as const;
      const isChosen = !!chosenCards[card];

      if (isChosen) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Returns HTML string with detailed result.
 * Supposed to work completely correctly only with 8 chosen cards.
 * But can be used to predict points for 7 cards as well.
 */
export function calculateMinimumPossiblePoints(chosenCards: ChosenCards, withAceMarriage: boolean): string {
  let sum = 0;
  let unaccountedCardsCount = 0;
  let movesCount = 0;

  const takenCards: ChosenCards = {};
  const marriage: Record<Suit, [hasMarriage: boolean, canBeUsed: boolean]> = {
    h: [false, false],
    d: [false, false],
    c: [false, false],
    s: [false, false],
  };

  // h -> s
  for (let i = 0; i < SUITS.length; i++) {
    // A -> 9
    for (let j = RANKS.length - 1; j >= 0; j--) {
      const suit = SUITS[i];
      const rank = RANKS[j];
      const card = `${rank}${suit}` as const;
      const isChosen = !!chosenCards[card];
      const isTaken = !!takenCards[card];
      // debugger;

      // first, mark the marriage if there is
      marriage[suit][0] = checkMarriage(chosenCards, suit);

      // don't calculate anything if the card is not chosen
      if (!isChosen) {
        // skip calculation if there is no A
        if (j === RANKS.length - 1) {
          break;
        }

        // stop if the card is free (in someone's hands)
        if (!isTaken) {
          break;
        }

        // proceed if the card is taken
        if (isTaken) {
          continue;
        }
      }

      if (rank === "K" && marriage[suit][0]) {
        marriage[suit][1] = true;
      }

      // add card value itself
      sum += RankValue[rank];
      // count the move
      movesCount++;

      // find minimal thrown card rank
      const thrownRank = RANKS.find(rank => {
        const card = `${rank}${suit}` as const;

        return chosenCards[card] !== true && takenCards[card] !== true;
      });

      if (thrownRank) {
        // add thrown card value
        sum += RankValue[thrownRank];
        // +1 card from another player (consider the worst case when all the suit has one player)
        unaccountedCardsCount++;
        // mark the card as used
        takenCards[`${thrownRank}${suit}`] = true;
      } else {
        // +2 cards from both players
        unaccountedCardsCount += 2;
      }
    }
  }

  // calculate the minimum possible points of taken cards
  if (unaccountedCardsCount > 0) {
    // 9 -> A
    for (let i = 0; i < RANKS.length; i++) {
      // h -> s
      for (let j = 0; j < SUITS.length; j++) {
        if (unaccountedCardsCount <= 0) {
          break;
        }

        const suit = SUITS[j];
        const rank = RANKS[i];
        const card = `${rank}${suit}` as const;
        const isChosen = !!chosenCards[card];
        const isTaken = !!takenCards[card];

        if (isChosen || isTaken) {
          continue;
        }

        sum += RankValue[rank];
        unaccountedCardsCount--;
      }
    }
  }

  const cardsPoints = sum; // at the moment `sum` is cards points only
  // TODO: change emoji
  let result = `${cardsPoints}  ${wrapEmoji("🪙")}`;

  /* START: calculate marriages */

  const usedMarriageSuites: Suit[] = [];

  // add used marriages
  SUITS.forEach((suit) => {
    if (marriage[suit][1]) {
      sum += SuitValue[suit];
      usedMarriageSuites.push(suit);
    }
  });

  // marriage on the latest move
  if (movesCount > 0 && movesCount < 8) {
    // find the biggest marriage that there is in the hands but not used
    const unusedBiggestMarriage = SUITS.find(suit => marriage[suit][0] && !marriage[suit][1])

    if (unusedBiggestMarriage) {
      sum += SuitValue[unusedBiggestMarriage];
      usedMarriageSuites.push(unusedBiggestMarriage);
    }
  }

  if (withAceMarriage && checkAceMarriage(chosenCards)) {
    sum += SuitValue.A;
    // TODO: change emoji
    result += ` + ${SuitValue.A} ${wrapEmoji("🃏")}`;
  }

  // add marriage points into result string (sorting starting from the biggest suit)
  SUITS.forEach((suit) => {
    if (usedMarriageSuites.includes(suit)) {
      result += ` + ${SuitValue[suit]} ${EmojiBySuit[suit]}`;
    }
  });

  /* END: calculate marriages */

  return `${result} = <b>${sum}</b>`;
}

function checkMarriage(chosenCards: ChosenCards, suit: Suit): boolean {
  return !!chosenCards[`K${suit}`] && !!chosenCards[`Q${suit}`];
}

function checkAceMarriage(chosenCards: ChosenCards): boolean {
  let aceCount = 0;
  let tenCount = 0;

  for (let i = 0; i < SUITS.length; i++) {
    const suit = SUITS[i];

    if (chosenCards[`A${suit}`]) {
      aceCount++;
    }

    if (chosenCards[`T${suit}`]) {
      tenCount++;
    }
  }

  return aceCount === 4 && tenCount >= 1;
}
