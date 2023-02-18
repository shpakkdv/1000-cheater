import { FC, useCallback, useEffect, useState } from 'react';
import cn from "classnames";
// @ts-ignore TODO
import CardUI from "react-free-playing-cards";

import styles from './Cards.module.scss';

const STORAGE_KEY = "CARDS__1000";

const ranks = ["9", "J", "Q", "K", "T", "A"] as const;
const suits = ["h", "d", "c", "s"] as const;

type Card = `${typeof ranks[number]}${typeof suits[number]}`;

export const Cards: FC = () => {
  const [chosenCards, setChosenCards] = useState<Partial<Record<Card, boolean>>>({});

  const onCardClick = useCallback((card: Card) => {
    if (chosenCards[card]) {
      const chosenCardsCopy = { ...chosenCards };
      delete chosenCardsCopy[card];

      setChosenCards(chosenCardsCopy);
    } else {
      setChosenCards({
        ...chosenCards,
        [card]: true,
      });
    }
  }, [chosenCards]);

  // Restore data after page loading
  useEffect(() => {
    const store = localStorage.getItem(STORAGE_KEY);

    if (store) {
      try {
        setChosenCards(JSON.parse(store));
      } catch {
        console.warn("Couldn't restore data.");
      }
    }
  }, []);

  // Set data to the storage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chosenCards));
  }, [chosenCards]);

  return (
    <div className={styles.cards}>
      {suits.map((suit, index) => {
        return (
          <div key={suit} className={styles.suit}>
            {ranks.map((rank) => {
              const card = `${rank}${suit}` as const;

              return (
                <div
                  key={rank}
                  className={cn(styles.card, { [styles.active]: chosenCards[card] })}
                  onClick={() => onCardClick(card)}
                >
                  <CardUI card={card} height="100%" />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
