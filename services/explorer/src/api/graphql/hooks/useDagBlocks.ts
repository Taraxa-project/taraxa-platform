import { useQuery } from 'urql';
import cleanDeep from 'clean-deep';
import { DagBlockFilters } from '../../types';
import { dagBlocksQuery, dagBlockQuery } from '../queries';

export const useDagBlocks = async ({
  dagLevel,
  count,
  reverse,
}: DagBlockFilters) => {
  const variables = cleanDeep({ dagLevel, count, reverse });

  const [result] = useQuery({
    query: dagBlocksQuery,
    variables,
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
