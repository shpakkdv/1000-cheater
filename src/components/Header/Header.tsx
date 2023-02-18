import { FC, useCallback } from 'react';

import styles from './Header.module.scss';

export const Header: FC = () => {
  const reset = useCallback(() => {
    localStorage.clear();
  }, []);

  return (
      <div className={styles.header}>
        <button onClick={reset}>Reset</button>
      </div>
    );
};
