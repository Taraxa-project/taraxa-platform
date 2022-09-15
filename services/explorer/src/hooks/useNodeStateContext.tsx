import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNodeState } from '../api';

type Context = {
  finalBlock: string;
  dagBlockLevel: string;
  dagBlockPeriod: string;
};

const initialState: Context = {
  finalBlock: null,
  dagBlockLevel: null,
  dagBlockPeriod: null,
};

const NodeStateContext = createContext<Context>(initialState);

export const NodeStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const resultNodeState = useNodeState();
  const [currentNodeState, setCurrentNodeState] = useState<Context>({
    finalBlock: null,
    dagBlockLevel: null,
    dagBlockPeriod: null,
  });

  useEffect(() => {
    resultNodeState
      .then((response) => {
        if (response?.data) {
          setCurrentNodeState(response?.data?.nodeState);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log('Err: ', err);
      });
  }, [resultNodeState]);

  return (
    <NodeStateContext.Provider value={currentNodeState}>
      {children}
    </NodeStateContext.Provider>
  );
};

export const useNoteStateContext = () => {
  return useContext(NodeStateContext);
};
