import { useCallback, useMemo } from 'react';
import useApi from './useApi';
import { DelegationGQL } from '../interfaces/Delegation';
import { CommissionChangeGQL } from '../interfaces/Validator';

export default () => {
  const basePath = process.env.REACT_APP_DPOS_SUBGRAPH_HOST || '';
  const { post } = useApi(basePath);

  const getValidatorDelegationsPaginate = useCallback(
    async (validator: string, page: number, pageCount: number): Promise<DelegationGQL[]> => {
      const query = `{
      delegations(where: {validator: "${validator.toLowerCase()}", amount_gt: 0},  orderBy: timestamp, orderDirection: desc, first: ${pageCount}, skip: ${
        page * pageCount
      }){
          id
          amount
          delegator
          validator
          timestamp
      }
  }`;
      const request = await post(basePath, { query });
      const delegations = request.response.data.delegations;
      return delegations;
    },
    [],
  );

  const getAllValidatorDelegations = useCallback(
    async (validator: string): Promise<DelegationGQL[]> => {
      const query = `{
            delegations(where: {validator: "${validator.toLowerCase()}", amount_gt: 0},  orderBy: timestamp, orderDirection: desc){
                id
                amount
                delegator
                validator
                timestamp
            }
        }`;
      const request = await post(basePath, { query });
      const delegations = request.response.data.delegations;
      return delegations;
    },
    [],
  );

  const getAllValidatorCommissionChanges = useCallback(
    async (validator: string): Promise<CommissionChangeGQL[]> => {
      const query = `{
            commissionChanges(where: {validator: "${validator.toLowerCase()}"}, orderBy: timestamp, orderDirection: desc){
              commission
              registrationBlock
              applianceBlock
              validator
              timestamp
            }
        }`;
      const request = await post(basePath, { query });
      let changes = request.response.data.commissionChanges;
      changes = [
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
      ];
      return changes;
    },
    [],
  );

  const getValidatorCommissionChangesPaginate = useCallback(
    async (validator: string, page: number, pageCount: number): Promise<CommissionChangeGQL[]> => {
      const query = `{
            commissionChanges(where: {validator: "${validator.toLowerCase()}"}, orderBy: timestamp, orderDirection: desc, first: ${pageCount}, skip: ${
        page * pageCount
      }){
              commission
              registrationBlock
              applianceBlock
              validator
              timestamp
            }
        }`;
      const request = await post(basePath, { query });
      let changes = request.response.data.commissionChanges;
      changes = [
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
        {
          commission: 133,
          registrationBlock: 10000,
          applianceBlock: 31000,
          validator: '0xd30975cC3E1Af9F26929Ab4F336265d2B10f10c9',
          timestamp: 1684154579,
        },
      ];
      return changes;
    },
    [],
  );
  return useMemo(
    () => ({
      getValidatorDelegationsPaginate,
      getAllValidatorDelegations,
      getAllValidatorCommissionChanges,
      getValidatorCommissionChangesPaginate,
    }),
    [
      getValidatorDelegationsPaginate,
      getAllValidatorDelegations,
      getAllValidatorCommissionChanges,
      getValidatorCommissionChangesPaginate,
    ],
  );
};
