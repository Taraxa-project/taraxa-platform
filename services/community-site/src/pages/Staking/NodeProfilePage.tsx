/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useCallback, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

import {
  BarChart,
  Button,
  Checkbox,
  Chip,
  Icons,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Text,
  Typography,
  theme,
} from '@taraxa_project/taraxa-ui';

import useDelegation from '../../services/useDelegation';
import useDposSubgraph from '../../services/useDposSubgraph';
import useCMetamask from '../../services/useCMetamask';
import useChain from '../../services/useChain';
import useTaraxaApi from '../../services/useTaraxaApi';
import './node-profile-page.scss';
import Modals from './Modal/Modals';
import NodeIcon from '../../assets/icons/node';

import { CommissionChangeGQL, Validator } from '../../interfaces/Validator';
import { stripEth, weiToEth } from '../../utils/eth';
import { useAllValidators } from '../../services/useAllValidators';
import NodeProfilePageSkeleton from './Screen/NodeProfilePageSkeleton';
import Nickname from '../../components/Nickname/Nickname';
import { DelegationGQL } from '../../interfaces/Delegation';
import { BarFlex } from './BarFlex';
import Title from '../../components/Title/Title';
import useIndexerYields, { YieldResponse } from '../../services/useIndexerYields';

enum ViewType {
  DELEGATIONS,
  COMMISSION_CHANGES,
}

const VALIDATOR_MAX_DELEGATION = 80000000;

function calculateDelegationSpread(validator: Validator | null, delegations: DelegationGQL[]) {
  const delegationPossible =
    validator?.delegation
      .add(validator?.availableForDelegation)
      .div(BigNumber.from('10').pow(BigNumber.from('18')))
      ?.toNumber() || VALIDATOR_MAX_DELEGATION;

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
  const { getValidator } = useTaraxaApi();
  const { getUndelegations } = useDelegation();
  const { getValidatorDelegationsPaginate, getValidatorCommissionChangesPaginate } =
    useDposSubgraph();
  const { getHistoricalYieldForAddress } = useIndexerYields();
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [yields, setYields] = useState<YieldResponse[]>([] as YieldResponse[]);
  const [accountUndelegationCount, setAccountUndelegationCount] = useState<number>(0);
  const [delegations, setDelegations] = useState<DelegationGQL[] | []>([]);
  const [commissionChanges, setCommissionChanges] = useState<CommissionChangeGQL[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(0);
  const [commissionPage, setCommissionPage] = useState<number>(0);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const [detailType, setDetailType] = useState<ViewType>(ViewType.DELEGATIONS);
  const { address } = useParams<{ address?: string }>();
  const [fetchCounter, setFetchCounter] = useState<number>(0);
  const { allValidatorsWithStats } = useAllValidators();

  const canDelegate = status === 'connected' && !!account && !validator?.isFullyDelegated;
  const canUndelegate = status === 'connected' && !!account && accountUndelegationCount === 0;

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

  const fetchYields = useCallback(async () => {
    if (address) {
      const yieldResponse = await getHistoricalYieldForAddress(address);
      setYields(yieldResponse);
    }
  }, [address]);

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
  }, [address, commissionPage]);

  const fetchUndelegations = useCallback(async () => {
    if (account && address) {
      const undelegations = await getUndelegations(account);
      const undelegationsOfAddress = undelegations.filter(
        (u) => u.address.toLowerCase() === address.toLowerCase(),
      ).length;
      setAccountUndelegationCount(undelegationsOfAddress);
    } else {
      setAccountUndelegationCount(0);
    }
  }, [address, account, getUndelegations]);

  useEffect(() => {
    fetchCommissionChanges();
  }, [fetchCommissionChanges]);

  useEffect(() => {
    fetchNode();
    fetchYields();
    fetchDelegators();
    fetchUndelegations();
  }, [fetchNode, fetchDelegators, fetchUndelegations, fetchCounter]);

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
          setFetchCounter((prev) => prev + 1);
        }}
        onUndelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
          setFetchCounter((prev) => prev + 1);
        }}
        onReDelegateSuccess={() => {
          fetchNode();
          fetchDelegators();
          setFetchCounter((prev) => prev + 1);
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
      {!validator ? (
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
              <div className="nodeInfoContent">{validator.yield || 0}%</div>
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
            {/* {validator?.firstBlockCreatedAt && (
              <>
                <div className="nodeInfoTitle">node active since</div>
                <div className="nodeInfoContent">{`${nodeActiveSince.getDate()} ${nodeActiveSince
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase()} ${nodeActiveSince.getFullYear().toString().substring(2)}`}</div>
              </>
            )} */}
            <div className="nodeDelegationColumn">
              <div className="nodeDelegationSplit">
                <Typography variant="caption" color="primary" className="box-title">
                  Available to delegate
                </Typography>
                <Typography variant="h6" color="primary" className="box-title">
                  {ethers.utils.commify(weiToEth(validator.availableForDelegation))} TARA
                </Typography>
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
          <br />
          <BarChart
            tick="%"
            title="Yield History in %"
            labels={[...yields].reverse().map((y) => `${y.fromBlock}`)}
            datasets={[
              {
                data: [...yields].reverse().map((y) => y.yield),
                borderRadius: 5,
                barThickness: 10,
                backgroundColor: theme.palette.secondary.main,
              },
            ]}
            bright
            withGrid
            withTooltip
            stepSize={5}
            fullWidth
          />
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
                label="Commission Changes"
                variant="contained"
                onClick={() => {
                  setDetailType(ViewType.COMMISSION_CHANGES);
                }}
                disabled={!commissionChanges?.length}
              />
            </div>
          </div>
          <div className="centeredContainer">
            <div className="validatorsTableContainer">
              <div className="delegatorsHeader">
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
              <br />
              <TableContainer className="validatorsTableContainer">
                {detailType === ViewType.DELEGATIONS && delegations.length !== 0 && (
                  <Table className="validatorsTable">
                    <TableHead className="tableHead">
                      <TableRow>
                        <TableCell className="halfCell">Delegator</TableCell>
                        <TableCell className="halfCell">Amount of TARA delegated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="">
                      {delegations.map((delegation, id) => (
                        <TableRow key={id} className="">
                          <TableCell className="halfCell">
                            {delegation.delegator}
                            {delegation.delegator.toLowerCase() === account?.toLowerCase() && (
                              <Chip
                                label="Your delegation"
                                variant="filled"
                                color="secondary"
                                style={{ marginLeft: '1rem' }}
                              />
                            )}
                            {validator.owner.toLowerCase() ===
                              delegation.delegator.toLowerCase() && (
                              <Chip
                                label="Self-delegation"
                                variant="filled"
                                color="info"
                                style={{ marginLeft: '1rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell className="halfCell">
                            {stripEth(delegation.amount)} TARA
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {detailType === ViewType.COMMISSION_CHANGES && commissionChanges.length !== 0 && (
                  <Table className="validatorsTable">
                    <TableHead className="tableHead">
                      <TableRow>
                        <TableCell className="quarterCell">Commission</TableCell>
                        <TableCell className="quarterCell">Registration Block</TableCell>
                        <TableCell className="quarterCell">Applied at Block</TableCell>
                        <TableCell className="quarterCell">Created at</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="">
                      {commissionChanges.map((change, id) => (
                        <TableRow key={id} className="">
                          <TableCell className="quarterCell">
                            {+(parseFloat(`${change.commission}` || '0') / 100).toPrecision(2)} %
                          </TableCell>
                          <TableCell className="quarterCell">{change.registrationBlock}</TableCell>
                          <TableCell className="quarterCell">{change.applyAtBlock}</TableCell>
                          <TableCell className="quarterCell">
                            {new Date(change.timestamp * 1000).toLocaleDateString()} -{' '}
                            {new Date(change.timestamp * 1000).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeProfilePage;
