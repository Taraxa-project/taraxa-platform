import { useQuery } from 'urql';
import { dagBlocksQuery, dagBlockQuery } from '../queries';

export const useDagBlocks = async (
  dagLevel: number,
  count: number,
  reverse?: boolean
) => {
  const [result] = useQuery({
    query: dagBlocksQuery,
    variables: { dagLevel, count, reverse },
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};

export const useDagBlock = async (hash: string) => {
  const [result] = useQuery({
    query: dagBlockQuery,
    variables: { hash },
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};
