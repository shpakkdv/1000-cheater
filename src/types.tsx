import type { RANKS, SUITS } from "const";

export type Rank = typeof RANKS[number];
export type Suit = typeof SUITS[number];

/** Suits with Ace marriage */
export type ExpandedSuit = Suit | "A";

export type Card = `${Rank}${Suit}`;

export type ChosenCards = Partial<Record<Card, boolean>>;
