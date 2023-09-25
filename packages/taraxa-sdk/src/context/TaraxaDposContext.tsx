import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ethers } from 'ethers';
import { TaraxaDposClient } from './TaraxaDposClient';

interface TaraxaDposContextProps {
  mainnetDpos: ethers.Contract | null;
  browserDpos: ethers.Contract | null;
}

const TaraxaDposContext = createContext<TaraxaDposContextProps>({
  mainnetDpos: null,
  browserDpos: null,
});

export const TaraxaDposProvider = ({
  networkIdOrName,
  children,
}: {
  networkIdOrName: number | string;
  children: React.ReactNode;
}): JSX.Element => {
  const [mainnetDpos, setMainnetDpos] = useState<ethers.Contract | null>(null);
  const [browserDpos, setBrowserDpos] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const taraxaDposClient = new TaraxaDposClient(networkIdOrName);
    setMainnetDpos(taraxaDposClient.mainnetDpos);
    setBrowserDpos(taraxaDposClient.browserDpos);
  }, [networkIdOrName]);

  const value = useMemo(() => {
    return { mainnetDpos, browserDpos };
  }, [mainnetDpos, browserDpos]);

  return (
    <TaraxaDposContext.Provider value={value}>
      {children}
    </TaraxaDposContext.Provider>
  );
};

export const useTaraxaDpos = (): TaraxaDposContextProps => {
  return useContext(TaraxaDposContext);
};
