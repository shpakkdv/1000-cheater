import { type FC, useCallback, useEffect, useState } from 'react';
import cn from "classnames";
// @ts-ignore TODO
import CardUI from "react-free-playing-cards";

import { RANKS, SUITS } from "const";
import { Card, ChosenCards } from "types";
import { Counter, calculateChosenCardsNumber } from "components/Counter";

import styles from './Cards.module.scss';

const STORAGE_KEY = "CARDS__1000";

export const Cards: FC = () => {
  const [chosenCards, setChosenCards] = useState<ChosenCards>({});
  const [chosenCardsNumber, setChosenCardsNumber] = useState(0);
  const [myHand, setMyHand] = useState<ChosenCards>({});

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

  // Calculate chosen cards number
  useEffect(() => {
    setChosenCardsNumber(calculateChosenCardsNumber(chosenCards));
  }, [chosenCards]);

  // Save the first 8 chosen cards as "my hand"
  useEffect(() => {
    if (chosenCardsNumber < 8) {
      setMyHand({ ...chosenCards });
    }
  }, [chosenCardsNumber, chosenCards]);

  // Restore data after page loading
  useEffect(() => {
    // TODO: improve by storing more data there
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
      <div className={styles.cardsCounter}>{chosenCardsNumber} / 24</div>

      {SUITS.map((suit) => {
        return (
          <div key={suit} className={styles.suit}>
            {RANKS.map((rank) => {
              const card = `${rank}${suit}` as const;
              const isActive = chosenCards[card];

              return (
                <div
                  key={rank}
                  className={cn(styles.card, { [styles.active]: isActive })}
                  onClick={() => onCardClick(card)}
                >
                  <CardUI card={card} height="100%" />
                  {isActive && (
                    <div className={styles.overlay}>
                      {myHand[card] && <span className={styles.myCard} title="My hand">✅</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <Counter chosenCards={chosenCards} chosenCardsNumber={chosenCardsNumber} />
    </div>
  );
};
