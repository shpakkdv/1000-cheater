import { type FC, useCallback, useEffect, useState } from "react";
import cn from "classnames";
// @ts-ignore TODO
import CardUI from "react-free-playing-cards";

import { RANKS, SUITS, CARDS_STORAGE_KEY } from "const";
import type { Card, ChosenCards } from "types";
import { useLocalStorage } from "hooks";
import { Counter } from "components/Counter";
import { calculateChosenCardsNumber } from "./utils";

import styles from './Cards.module.scss';

interface CardsStorage {
  chosenCards: ChosenCards;
  handCards: ChosenCards;
}

export const Cards: FC = () => {
  const [chosenCards, setChosenCards] = useState<ChosenCards>({});
  const [chosenCardsNumber, setChosenCardsNumber] = useState(0);
  const [handCards, setHandCards] = useState<ChosenCards>({});

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
    if (calculateChosenCardsNumber(chosenCards) <= 8) {
      setHandCards({ ...chosenCards });
    }
  }, [chosenCards]);

  const restoreData = useCallback((storage: CardsStorage) => {
    const { chosenCards, handCards } = storage;

    setChosenCards(chosenCards);
    setHandCards(handCards);
  }, []);

  const cardsSettingsObject: CardsStorage = {
    chosenCards,
    handCards,
  };

  useLocalStorage(restoreData, cardsSettingsObject, CARDS_STORAGE_KEY);

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
                      {handCards[card] && <span className={styles.myCard} title="My hand">✅</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <Counter chosenCards={chosenCards} handCards={handCards} />
    </div>
  );
};
