import type { Rank, Suit, ExpandedSuit } from "types";
import { wrapEmoji } from "utils";

export const RANKS = ["9", "J", "Q", "K", "T", "A"] as const;
export const SUITS = ["h", "d", "c", "s"] as const;

/**
 * Useful links:
 * @see https://www.piliapp.com/emoji/list/playing-cards/
 * @see https://emojipedia.org/
 *
 * NOTE: all emojis must be wrapped
 */
export const EmojiBySuit: Record<Suit, string> = {
  "h": wrapEmoji("❤️"), // hearts
  "d": wrapEmoji("♦️"), // diamonds
  "c": wrapEmoji("♣️"), // clubs
  "s": wrapEmoji("♠️"), // spades
};

export const RankValue: Record<Rank, number> = {
  9: 0,
  J: 2,
  Q: 3,
  K: 4,
  T: 10,
  A: 11,
};

export const SuitValue: Record<ExpandedSuit, number> = {
  A: 200, // Ace marriage
  h: 100,
  d: 80,
  c: 60,
  s: 40,
};
