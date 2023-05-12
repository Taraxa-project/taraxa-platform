import { useMemo } from 'react';
import useApi from './useApi';
import { DelegationGQL } from '../interfaces/Delegation';

export default () => {
  const basePath = process.env.REACT_APP_DPOS_SUBGRAPH_HOST || '';
  const { post } = useApi(basePath);

  const getValidatorDelegations = async (validator: string): Promise<DelegationGQL[]> => {
    const query = `{
            delegations(where: {validator: "${validator.toLowerCase()}", amount_gt: 0}){
                id
                amount
                delegator
                validator
            }
        }`;
    const request = await post(basePath, { query });
    const delegations = request.response.data.delegations;
    return delegations;
  };
  return useMemo(
    () => ({
      getValidatorDelegations,
    }),
    [getValidatorDelegations],
  );
};
