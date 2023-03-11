import { RANKS, SUITS } from "const";
import type { ChosenCards } from "types";

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
