import { FC } from 'react';

import { Cards } from "components/Cards";
import { Header } from "components/Header";
import styles from "./App.module.scss";

export const App: FC = () => {
  return (
    <div className={styles.app}>
      <Header />
      <Cards />
    </div>
  );
};
