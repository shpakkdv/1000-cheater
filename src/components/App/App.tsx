import { FC } from 'react';

import { Cards } from "components/Cards";
import { Header } from "components/Header";

export const App: FC = () => {
  return (
    <div>
      <Header />
      <Cards />
    </div>
  );
};
