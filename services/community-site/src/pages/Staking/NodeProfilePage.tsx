/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useCallback, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

import { AmountCard, Button, Checkbox, Chip, Icons, Text } from '@taraxa_project/taraxa-ui';

import useDposSubgraph from '../../services/useDposSubgraph';
import useCMetamask from '../../services/useCMetamask';
import useChain from '../../services/useChain';
import useValidators from '../../services/useValidators';
import './node-profile-page.scss';
import Modals from './Modal/Modals';
import NodeIcon from '../../assets/icons/node';

import { CommissionChangeGQL, Validator } from '../../interfaces/Validator';
import { stripEth, weiToEth } from '../../utils/eth';
import { useAllValidators } from '../../services/useAllValidators';
import NodeProfilePageSkeleton from './Screen/NodeProfilePageSkeleton';
import { useLoading } from '../../services/useLoading';
import Nickname from '../../components/Nickname/Nickname';
import { DelegationGQL } from '../../interfaces/Delegation';
import { BarFlex } from './BarFlex';
import Title from '../../components/Title/Title';

enum ViewType {
  DELEGATIONS,
  COMMISSION_CHANGES,
}

function calculateDelegationSpread(validator: Validator | null, delegations: DelegationGQL[]) {
  const delegationPossible =
    validator?.delegation
      .add(validator?.availableForDelegation)
      .div(BigNumber.from('10').pow(BigNumber.from('18')))
      ?.toNumber() || 1;

  const hasOwnDelegation = delegations.find(
    (d) => d.delegator.toLowerCase() === validator?.owner?.toLowerCase(),
  );
  const ownDelegation = hasOwnDelegation
    ? BigNumber.from(hasOwnDelegation.amount)
        .div(BigNumber.from('10').pow(BigNumber.from('18')))
        ?.toNumber()
    : 0;

  const availableForDelegation = parseFloat(
    (validator?.availableForDelegation || BigNumber.from(0))
      .div(BigNumber.from('10').pow(BigNumber.from('18')))
      ?.toString() || '0',
  );

  const validatorDelegation = parseFloat(
    validator?.delegation?.div(BigNumber.from('10').pow(BigNumber.from('18')))?.toString() || '1',
  );
  const communityDelegatedTotal = validatorDelegation - ownDelegation;

  const communityDelegated =
    delegations.length > 0
      ? Math.max(Math.round(communityDelegatedTotal * 100) / delegationPossible, 1)
      : 0;

  const selfDelegated = Math.max(Math.round((ownDelegation / delegationPossible) * 100), 1);

  const availableDelegation = Math.max(
    Math.round((availableForDelegation / delegationPossible) * 100),
    1,
  );
  return { availableDelegation, selfDelegated, communityDelegated };
}

const TABLE_ROWS_PER_PAGE = 20;

const NodeProfilePage = () => {
  const { provider } = useChain();
  const { status, account } = useCMetamask();
  const { getValidator } = useValidators();
  const { getValidatorDelegationsPaginate, getValidatorCommissionChangesPaginate } =
    useDposSubgraph();
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [delegations, setDelegations] = useState<DelegationGQL[] | []>([]);
  const [commissionChanges, setCommissionChanges] = useState<CommissionChangeGQL[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(0);
  const [commissionPage, setCommissionPage] = useState<number>(0);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const [detailType, setDetailType] = useState<ViewType>(ViewType.DELEGATIONS);
  const { address } = useParams<{ address?: string }>();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { allValidatorsWithStats } = useAllValidators();
  const { isLoading } = useLoading();

  const canDelegate = status === 'connected' && !!account && !validator?.isFullyDelegated;
  const canUndelegate = status === 'connected' && !!account;

  const fetchNode = useCallback(async () => {
    if (address) {
      const ownValidator = await getValidator(address);
      setValidator({
        ...ownValidator,
        pbftsProduced: 0,
        yield: 0,
      });
      const validator = allValidatorsWithStats.find((v: Validator) => v.address === address);
      setValidator({
        ...ownValidator,
        pbftsProduced: validator?.pbftsProduced || 0,
        yield: validator?.yield || 0,
      });
    }
  }, [address, allValidatorsWithStats]);

  const fetchDelegators = useCallback(async () => {
    if (address) {
      let delegations = await getValidatorDelegationsPaginate(
        address,
        delegationPage,
        TABLE_ROWS_PER_PAGE,
      );
      if (delegationAtTop) {
        const myDelegation = delegations.find(
          (d) => d.delegator.toLowerCase() === account?.toLowerCase(),
        );
        if (myDelegation) {
          delegations = delegations.filter(
            (d) => d.delegator.toLowerCase() !== account?.toLowerCase(),
          );
          delegations.unshift(myDelegation);
        }
      }
      setDelegations(delegations);
    } else {
      setDelegations([]);
    }
  }, [address, delegationAtTop, delegationPage]);

  const fetchCommissionChanges = useCallback(async () => {
    if (address) {
      const commissionChanges = await getValidatorCommissionChangesPaginate(
        address,
        commissionPage,
        TABLE_ROWS_PER_PAGE,
      );
      setCommissionChanges(commissionChanges);
    } else {
      setCommissionChanges([]);
    }
  }, [address]);

  useEffect(() => {
    fetchNode();
    fetchDelegators();
    fetchCommissionChanges();
  }, [fetchNode, fetchDelegators, fetchCommissionChanges, shouldFetch]);

  useEffect(() => {
    (async () => {
      if (status === 'connected' && account && provider) {
        setBalance(await provider.getBalance(account));
      }
    })();
  }, [status, account, provider]);

  const { availableDelegation, selfDelegated, communityDelegated } = calculateDelegationSpread(
    validator,
    delegations,
  );

  return (
    <div className="runnode">
      <Modals
        balance={balance}
        reDelegatableBalance={ethers.BigNumber.from('0')}
        delegateToValidator={delegateToValidator}
        showRedelegation={false}
        undelegateFromValidator={undelegateFromValidator}
        onDelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onUndelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onReDelegateSuccess={() => {
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onDelegateClose={() => setDelegateToValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
        claimAmount={BigNumber.from('0')}
        claimRewardsFromValidator={null}
        onClaimSuccess={() => {}}
        onClaimFinish={() => {}}
        onClaimClose={() => {}}
      />
      <Title title="Validator" />
      {!validator || isLoading ? (
        <NodeProfilePageSkeleton />
      ) : (
        <div className="nodeInfoWrapper">
          <div className="nodeInfoFlex">
            <div className="nodeInfoColumn">
              <Nickname
                size="large"
                showIcon
                address={validator.address}
                description={validator.description}
              />
              <div className="nodeInfoTitle">yield efficiency</div>
              <div className="nodeInfoContent">{validator.yield || 0}</div>
              <div className="nodeInfoTitle">commission</div>
              <div className="nodeInfoContent">{validator.commission}%</div>
              {validator.endpoint && (
                <>
                  <div className="nodeInfoTitle">node operator Website</div>
                  <div className="nodeInfoContent">
                    <a rel="nofollow" href={validator.endpoint}>
                      {validator.endpoint}
                    </a>
                  </div>
                </>
              )}
            </div>
            <div className="nodeDelegationColumn">
              <div className="taraContainerWrapper">
                <div className="taraContainer">
                  <AmountCard
                    amount={ethers.utils.commify(
                      Number(weiToEth(validator.availableForDelegation)).toFixed(2),
                    )}
                    unit="TARA"
                  />
                  <div className="taraContainerAmountDescription">Available for delegation</div>
                </div>
                <div className="taraContainer">
                  <AmountCard
                    amount={ethers.utils.commify(Number(weiToEth(validator.delegation)).toFixed(2))}
                    unit="TARA"
                  />
                  <div className="taraContainerAmountDescription">Total delegated</div>
                </div>
              </div>
              <div className="nodeDelegationSplit">
                <BarFlex
                  communityDelegated={communityDelegated}
                  selfDelegated={selfDelegated}
                  availableDelegation={availableDelegation}
                />
                <div className="percentagesBar">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                <div className="percentageLegends">
                  <div className="percentageLegend">
                    <div className="legendColor" style={{ background: '#15AC5B' }} />
                    community-delegated
                  </div>
                  <div className="percentageLegend">
                    <div className="legendColor" style={{ background: '#8E8E8E' }} />
                    self-delegated
                  </div>
                  <div className="percentageLegend">
                    <div className="legendColor" style={{ background: '#48BDFF' }} />
                    available for delegation
                  </div>
                </div>
              </div>
              <div className="delegationButtons">
                <Button
                  onClick={() => setDelegateToValidator(validator)}
                  variant="contained"
                  color="secondary"
                  label="Delegate"
                  disabled={!canDelegate}
                />
                <Button
                  onClick={() => setUndelegateFromValidator(validator)}
                  variant="contained"
                  color="secondary"
                  label="Un-Delegate"
                  disabled={!canUndelegate}
                />
              </div>
            </div>
          </div>
          <>
            <hr className="nodeInfoDivider" />
            <div className="nodeTypes">
              <div className="nodeTitleContainer">
                <NodeIcon />
                <Text label="Stats" variant="h6" color="primary" className="box-title" />
                <Button
                  size="small"
                  className={clsx('nodeTypeTab', detailType === ViewType.DELEGATIONS && 'active')}
                  label="Delegations"
                  variant="contained"
                  onClick={() => {
                    setDetailType(ViewType.DELEGATIONS);
                  }}
                />
                <Button
                  size="small"
                  className={clsx(
                    'nodeTypeTab',
                    detailType === ViewType.COMMISSION_CHANGES && 'active',
                  )}
                  label="Commissions"
                  variant="contained"
                  onClick={() => {
                    setDetailType(ViewType.COMMISSION_CHANGES);
                  }}
                />
              </div>
            </div>
            <div className="tableContainer">
              <div className="delegatorsHeader">
                <span className="delegatorsLegend">
                  {detailType === ViewType.DELEGATIONS ? 'Delegators' : 'Commission Changes'}
                </span>
                {detailType === ViewType.DELEGATIONS && (
                  <div className="showOwnDelegation">
                    <Checkbox
                      value={delegationAtTop}
                      checked={delegationAtTop}
                      onChange={(e) => setDelegationAtTop(e.target.checked)}
                    />
                    Show my delegation at the top
                  </div>
                )}
                <div className="delegatorsPagination">
                  <Button
                    className="paginationButton"
                    onClick={() =>
                      detailType === ViewType.DELEGATIONS
                        ? setDelegationPage(delegationPage - 1)
                        : setCommissionPage(commissionPage - 1)
                    }
                    disabled={
                      detailType === ViewType.DELEGATIONS
                        ? delegationPage === 0
                        : commissionPage === 0
                    }
                    Icon={Icons.Left}
                  />
                  <Button
                    className="paginationButton"
                    onClick={() =>
                      detailType === ViewType.DELEGATIONS
                        ? setDelegationPage(delegationPage + 1)
                        : setCommissionPage(commissionPage + 1)
                    }
                    disabled={
                      detailType === ViewType.DELEGATIONS
                        ? delegations.length < TABLE_ROWS_PER_PAGE
                        : commissionChanges.length < TABLE_ROWS_PER_PAGE
                    }
                    Icon={Icons.Right}
                  />
                </div>
              </div>
              {detailType === ViewType.DELEGATIONS && delegations.length !== 0 && (
                <>
                  <div className="tableHeader">
                    <span>Address</span>
                    <span>Amount of TARA delegated</span>
                  </div>
                  <div className="delegators">
                    {delegations.map((delegation, id) => (
                      <div key={id} className="delegatorRow">
                        <div className="address">
                          <span>{id + 1}.</span> {delegation.delegator}
                        </div>
                        <div className="badges">
                          {delegation.delegator.toLowerCase() === account?.toLowerCase() && (
                            <Chip label="Your delegation" variant="filled" color="warning" />
                          )}
                        </div>
                        <div className="amount">{stripEth(delegation.amount)} TARA</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
          {detailType === ViewType.COMMISSION_CHANGES && commissionChanges.length !== 0 && (
            <div className="tableContainer">
              <div className="tableHeader">
                <span>Commission</span>
                <span>Registration Block</span>
                <span>Applied at Block</span>
                <span>Creation timestamp</span>
              </div>
              <div className="delegators">
                {commissionChanges.map((change, id) => (
                  <div key={id} className="commissionRow">
                    <div className="amount">
                      <span>{id + 1}.</span> {change.commission / 100} %
                    </div>
                    <div className="amount">{change.registrationBlock}</div>
                    <div className="amount">{change.applianceBlock}</div>
                    <div className="amount">{change.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeProfilePage;
