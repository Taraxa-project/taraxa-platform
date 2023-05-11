import { useMemo } from 'react';
import useApi from './useApi';

export default () => {
  const basePath = process.env.REACT_APP_DPOS_SUBGRAPH_HOST || '';
  const { post } = useApi(basePath);

  const getValidatorDelegations = async (validator: string) => {
    const query = `{
            delegations(where: {validator: "${validator.toLowerCase()}", amount_gte: 0}){
                id
                amount
                delegator
                validator
            }
        }`;
    const request = await post(basePath, { query });
    console.log(request.response);
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
