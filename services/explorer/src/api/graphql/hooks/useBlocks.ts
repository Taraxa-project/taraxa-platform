import { useQuery } from 'urql';
import cleanDeep from 'clean-deep';
import { PbftBlocksFilters, PbftBlockDetailsFilters } from '../../types';
import { blocksQuery, blockQuery } from '../queries';

export const useBlocks = async ({ from, to }: PbftBlocksFilters) => {
  const variables = cleanDeep({ from, to });

  const [result] = useQuery({
    query: blocksQuery,
    variables,
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};

export const useBlock = async ({ hash, number }: PbftBlockDetailsFilters) => {
  const variables = cleanDeep({ hash, number });

  const [result] = useQuery({
    query: blockQuery,
    variables,
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};
