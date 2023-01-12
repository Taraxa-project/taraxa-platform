import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { nodeStateQuery, POOLING_INTERVAL } from '../api';

type Context = {
  finalBlock: number;
  dagBlockLevel: number;
  dagBlockPeriod: number;
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
}): JSX.Element => {
  const [{ fetching, data }, reexecuteQuery] = useQuery({
    query: nodeStateQuery,
  });
  const [currentNodeState, setCurrentNodeState] = useState<Context>({
    finalBlock: null,
    dagBlockLevel: null,
    dagBlockPeriod: null,
  });

  useEffect(() => {
    if (data) {
      setCurrentNodeState(data?.nodeState);
    }
  }, [data]);

  useEffect(() => {
    if (fetching) return;

    const timerId = setTimeout(() => {
      reexecuteQuery({ requestPolicy: 'network-only' });
    }, POOLING_INTERVAL);

    return () => clearTimeout(timerId);
  }, [fetching, reexecuteQuery]);

  return (
    <NodeStateContext.Provider value={currentNodeState}>
      {children}
    </NodeStateContext.Provider>
  );
};

export const useNodeStateContext = (): Context => {
  return useContext(NodeStateContext);
};
