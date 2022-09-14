import { useQuery } from 'urql';
import { transactionQuery } from '../queries';

export const useTransaction = async (hash: string) => {
  const [result] = useQuery({
    query: transactionQuery,
    variables: { hash },
  });
  const { data, fetching, error } = result;

  return {
    data,
    fetching,
    error,
  };
};
