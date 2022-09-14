import { useQuery } from 'urql';
import { nodeStateQuery } from '../queries';

export const useNodeState = async () => {
  const [result] = useQuery({
    query: nodeStateQuery,
  });
  return result;
};
