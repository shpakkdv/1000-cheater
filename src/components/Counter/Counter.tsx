import cn from "classnames";
import { type FC, useCallback, useEffect, useState } from "react";

import { RANKS, SUITS, EmojiBySuit, SETTINGS_STORAGE_KEY } from "const";
import { useLocalStorage } from "hooks";
import type { Card, ChosenCards, Rank, Suit } from "types";
import { calculateMinimumPossiblePoints } from "./utils";

import styles from "./Counter.module.scss";

type CheckedSuits = Partial<Record<Suit, [player1: boolean, player2: boolean, disabled: boolean]>>;

const PlayerKeys = ["pl1", "pl2"] as const;
type PlayerKey = typeof PlayerKeys[number];

type PlayerNames = Record<PlayerKey, string>;

const DefaultPlayerNameByKey: PlayerNames = {
  "pl1": "Player 1",
  "pl2": "Player 2",
};

interface SettingsStorage {
  checkedSuits: CheckedSuits;
  playerNames: PlayerNames;
  minimumPossiblePoints: string;
  withAceMarriage: boolean;
}

interface CounterProps {
  chosenCards: ChosenCards;
  handCards: ChosenCards;
}

export const Counter: FC<CounterProps> = ({ chosenCards, handCards }) => {
  const [checkedSuits, setCheckedSuits] = useState<CheckedSuits>({});
  const [playerNames, setPlayerName] = useState<PlayerNames>(DefaultPlayerNameByKey);
  const [activeInput, setActiveInput] = useState<PlayerKey | null>(null);
  const [withAceMarriage, setWithAceMarriage] = useState(true);
  const [minimumPossiblePoints, setMinimumPossiblePoints] = useState("");

  const resetActiveInput = useCallback(() => setActiveInput(null), []);
  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLInputElement>>((event) => {
    if (event.key === "Enter") {
      resetActiveInput();
    }
  }, [resetActiveInput]);

  const onChangePlayerName = useCallback((playerKey: PlayerKey, event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(playerNames => {
      return {
        ...playerNames,
        [playerKey]: event.target.value,
      };
    });
  }, []);

  const onChangeCheckbox = useCallback((suit: Suit, playerIndex: number) => {
    setCheckedSuits(checkedSuits => {
      const newCheckedSuits = { ...checkedSuits };
      const playerInfo = newCheckedSuits[suit];

      if (playerInfo) {
        newCheckedSuits[suit] = [...playerInfo];
      } else {
        newCheckedSuits[suit] = [false, false, false];
      }
      newCheckedSuits[suit]![playerIndex] = !newCheckedSuits[suit]?.[playerIndex];

      return newCheckedSuits;
    });
  }, []);

  const onWithAceMarriageChange = useCallback(() => {
    setWithAceMarriage(withAceMarriage => !withAceMarriage);
  }, []);

  // auto-detection used suits
  useEffect(() => {
    const cards = (Object.keys(chosenCards) as Card[]).filter(card => chosenCards[card]);
    const cardsBySuit = cards.reduce<Partial<Record<Suit, Rank[]>>>((cardsBySuit, card) => {
      const [rank, suit] = card.split("") as [Rank, Suit];

      cardsBySuit[suit] ??= [];
      cardsBySuit[suit]!.push(rank);

      return cardsBySuit;
    }, {});

    // automatically checked (when no more cards)
    const requiredCheckedSuits = SUITS.reduce<CheckedSuits>((requiredCheckedSuits, suit) => {
      const cards = cardsBySuit[suit];

      if (cards?.length === RANKS.length) {
        requiredCheckedSuits[suit] = [true, true, true];
      }

      return requiredCheckedSuits;
    }, {});

    // automatically unchecked (when cards were unchecked)
    const uncheckedSuits = (Object.keys(checkedSuits) as Suit[]).reduce<CheckedSuits>((uncheckedSuits, suit) => {
      const [,, disabled] = checkedSuits[suit]!;

      if (disabled && cardsBySuit[suit]?.length !== RANKS.length) {
        requiredCheckedSuits[suit] = [false, false, false];
      }

      return uncheckedSuits;
    }, {});

    const newCheckedSuits = {
      ...checkedSuits,
      ...uncheckedSuits,
      ...requiredCheckedSuits,
    };

    if (JSON.stringify(newCheckedSuits) !== JSON.stringify(checkedSuits)) {
      setCheckedSuits(newCheckedSuits);
    }
  }, [chosenCards, checkedSuits]);

  // auto-calculation of points
  useEffect(() => {
    setMinimumPossiblePoints(calculateMinimumPossiblePoints(handCards, withAceMarriage));
  }, [handCards, withAceMarriage]);


  const restoreData = useCallback((storage: SettingsStorage) => {
    const { playerNames, checkedSuits, minimumPossiblePoints } = storage;

    setPlayerName(playerNames);
    setCheckedSuits(checkedSuits);
    setMinimumPossiblePoints(minimumPossiblePoints);
  }, []);

  const storageSettingsObject: SettingsStorage = {
    playerNames,
    checkedSuits,
    minimumPossiblePoints,
    withAceMarriage,
  };

  useLocalStorage(restoreData, storageSettingsObject, SETTINGS_STORAGE_KEY);

  return (
    <div className={styles.counter}>
      <div>
        {PlayerKeys.map((playerKey, playerIndex) => (
          <div key={playerKey} className={styles.player}>
            {
              activeInput === playerKey
                ? (
                  <input
                    type="text"
                    value={playerNames[playerKey]}
                    onChange={(event) => onChangePlayerName(playerKey, event)}
                    className={styles.name}
                    onBlur={resetActiveInput}
                    onKeyDown={onKeyDown}
                    autoFocus={true}
                  />
                ) : (
                  <div
                    className={styles.name}
                    onDoubleClick={() => setActiveInput(playerKey)}
                  >
                    {playerNames[playerKey]}
                  </div>
                )
            }

            {SUITS.map((suit) => {
              const id = `${playerKey}_${suit}`;

              return (
                <span key={id} className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id={id}
                    checked={!!checkedSuits[suit]?.[playerIndex]}
                    disabled={!!checkedSuits[suit]?.[2]}
                    onChange={() => onChangeCheckbox(suit, playerIndex)}
                  />
                  <label className={styles.suitLabel} htmlFor={id} dangerouslySetInnerHTML={{ __html: EmojiBySuit[suit] }} />
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <div dangerouslySetInnerHTML={{ __html: `<b>Points:</b> ${minimumPossiblePoints}` }} />
        <div className={cn(styles.checkboxContainer, styles.aceCheckbox)}>
          <input
            type="checkbox"
            id="ace_marriage"
            checked={withAceMarriage}
            onChange={onWithAceMarriageChange}
          />
          <label htmlFor="ace_marriage">With Ace marriage</label>
        </div>
      </div>
    </div>
  );
};
