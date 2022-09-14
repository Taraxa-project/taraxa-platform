import { useQuery } from 'urql';
import { blocksQuery, blockQuery } from '../queries';

export const useBlocks = async (from: string, to: string) => {
  const [result] = useQuery({
    query: blocksQuery,
    variables: { from, to },
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};

export const useBlock = async (hash: string, number?: number) => {
  const [result] = useQuery({
    query: blockQuery,
    variables: { hash, number },
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};
