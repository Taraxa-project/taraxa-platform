import { useQuery } from 'urql';
import { nodeStateQuery } from '../queries';

export const useNodeState = async () => {
  const [result] = useQuery({
    query: nodeStateQuery,
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};
