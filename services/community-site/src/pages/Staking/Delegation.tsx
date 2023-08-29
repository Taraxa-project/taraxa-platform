import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';

import {
  Divider,
  Text,
  Notification,
  Button,
  Switch,
  BaseCard,
  useInterval,
  LoadingTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  MuiIcons,
} from '@taraxa_project/taraxa-ui';

import { blocksToDays } from '../../utils/time';
import { useAuth } from '../../services/useAuth';
import { useLoading } from '../../services/useLoading';
import Title from '../../components/Title/Title';
import WrongNetwork from '../../components/WrongNetwork';

import useCMetamask from '../../services/useCMetamask';
import useMainnet from '../../services/useMainnet';
import useValidators from '../../services/useValidators';
import useDelegation from '../../services/useDelegation';
import useChain from '../../services/useChain';

import Modals from './Modal/Modals';
import ValidatorRow from './Table/ValidatorRow';

import './delegation.scss';
import { Validator } from '../../interfaces/Validator';
import DelegationInterface, { COMMISSION_CHANGE_THRESHOLD } from '../../interfaces/Delegation';

import { stripEth, weiToEth } from '../../utils/eth';
import Undelegation from '../../interfaces/Undelegation';
import { useWalletPopup } from '../../services/useWalletPopup';
import useExplorerStats from '../../services/useExplorerStats';
import { useAllValidators } from '../../services/useAllValidators';
import { useRedelegation } from '../../services/useRedelegation';
import useIndexerYields from '../../services/useIndexerYields';

const Delegation = ({ location }: { location: Location }) => {
  const { user } = useAuth();
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();
  const { isLoading } = useLoading();
  const { asyncCallback } = useWalletPopup();

  const { getYieldForAddress } = useIndexerYields();
  const { getValidators, getValidatorsWith } = useValidators();
  const { updateValidatorsStats } = useExplorerStats();
  const { getDelegations, getUndelegations, confirmUndelegate, cancelUndelegate } = useDelegation();
  const { validatorFrom, showPopup, clearRedelegation } = useRedelegation();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [ownValidators, setOwnValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<DelegationInterface[]>([]);
  const [undelegations, setUndelegations] = useState<Undelegation[]>([]);

  const showMyValidatorsQuery =
    new URLSearchParams(location.search).get('show_my_validators') !== null;
  const [showMyValidators, setShowMyValidators] = useState(showMyValidatorsQuery || false);
  const [showFullyDelegatedValidators, setShowFullyDelegatedValidators] = useState(true);
  const { allValidatorsWithStats } = useAllValidators();

  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [claimAmount, setClaimAmount] = useState(ethers.BigNumber.from('0'));
  const [currentBlock, setCurrentBlock] = useState(0);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [claimRewardsFromValidator, setClaimRewardsFromValidator] = useState<Validator | null>(
    null,
  );
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortedBy, setSortedBy] = useState<keyof Validator | ''>('');
  const [hideSortIcons, setHideSortIcons] = useState<Record<string, boolean>>({});

  const computeScore = (validator: Validator) => {
    const yieldWeight = 0.5;
    const delegationWeight = 0.5;
    const normalizedDelegation = Number(validator.delegation.toString()) / 1e18;
    return yieldWeight * validator.yield + delegationWeight * normalizedDelegation;
  };

  const sortValidators = (validators: Validator[]) => {
    if (!sortedBy) {
      return [...validators].sort((a, b) => {
        const scoreA = computeScore(a);
        const scoreB = computeScore(b);
        return scoreB - scoreA; // Sort in descending order of score
      });
    }

    return [...validators].sort((a, b) => {
      switch (sortedBy) {
        case 'status':
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);

        case 'yield':
          return sortOrder === 'asc' ? a.yield - b.yield : b.yield - a.yield;

        case 'commission':
          return sortOrder === 'asc' ? a.commission - b.commission : b.commission - a.commission;

        case 'delegation':
          if (a.delegation.lt(b.delegation)) return sortOrder === 'asc' ? -1 : 1;
          if (a.delegation.gt(b.delegation)) return sortOrder === 'asc' ? 1 : -1;
          return 0;

        case 'availableForDelegation':
          if (a.availableForDelegation.lt(b.availableForDelegation))
            return sortOrder === 'asc' ? -1 : 1;
          if (a.availableForDelegation.gt(b.availableForDelegation))
            return sortOrder === 'asc' ? 1 : -1;
          return 0;

        default:
          return 0;
      }
    });
  };

  const isSortColumnActive = (column: string): boolean => {
    return sortedBy === column;
  };

  const hideShowDefaultSortIcon = (column: string, value: boolean): void => {
    if (!isSortColumnActive(column)) {
      setHideSortIcons((prevState) => ({
        ...prevState,
        [column]: value,
      }));
    }
  };

  const handleSort = (column: keyof Validator) => {
    if (sortedBy === column) {
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortedBy(column);
      setSortOrder('asc');
    }
  };

  const fetchBalance = async () => {
    if (status === 'connected' && account && provider) {
      setBalance(await provider.getBalance(account));
    }
  };
  const getCurrentBlock = async () => {
    if (status === 'connected' && account && provider) {
      setCurrentBlock(await provider.getBlockNumber());
    }
  };

  const initClaim = (amount: ethers.BigNumber, validator: Validator) => {
    setClaimAmount(amount);
    setClaimRewardsFromValidator(validator);
  };

  const confirmUndelegation = async (undelegation: Undelegation) => {
    await asyncCallback(async () => {
      return confirmUndelegate(undelegation.address);
    });
    setShouldFetch(true);
  };

  const cancelUndelegation = async (undelegation: Undelegation) => {
    await asyncCallback(async () => {
      return cancelUndelegate(undelegation.address);
    });
    setShouldFetch(true);
  };

  const getYieldsForValidators = async (validators: Validator[]): Promise<Validator[]> => {
    for (let i = 0; i < validators.length; i++) {
      const validatorYield = await getYieldForAddress(validators[i].address);
      validators[i].yield = validatorYield.yield;
    }
    return validators;
  };

  useEffect(() => {
    const newHideSortIcons = Object.keys(hideSortIcons).reduce((acc, column) => {
      acc[column] = false;
      return acc;
    }, {} as Record<string, boolean>);

    if (sortedBy) {
      newHideSortIcons[sortedBy] = true;
    }

    setHideSortIcons(newHideSortIcons);
  }, [sortedBy]);

  useEffect(() => {
    fetchBalance();
  }, [status, account, chainId, shouldFetch]);

  useInterval(async () => {
    fetchBalance();
    getCurrentBlock();
  }, 5000);

  useEffect(() => {
    if (status === 'connected' && account) {
      (async () => {
        setDelegations(await getDelegations(account));
      })();
    }
  }, [status, account, chainId, shouldFetch]);

  useEffect(() => {
    if (status === 'connected' && account && provider) {
      (async () => {
        const unDelegations = await getUndelegations(account);
        setUndelegations(unDelegations);
      })();
    }
  }, [status, account, chainId, shouldFetch]);

  useEffect(() => {
    if (delegations.length > 0) {
      (async () => {
        const myValidators = await getValidatorsWith(delegations.map((d) => d.address));
        const myValidatorsWithStats = await updateValidatorsStats(myValidators);
        const myValidatorsWithYields = await getYieldsForValidators(myValidatorsWithStats);
        setOwnValidators(myValidatorsWithYields);
      })();
    }
  }, [delegations]);

  useEffect(() => {
    (async () => {
      let v;
      if (showMyValidators) {
        v = ownValidators || [];
      } else {
        v = allValidatorsWithStats;
      }
      setValidators(v);
    })();
  }, [showMyValidators, ownValidators, allValidatorsWithStats]);

  const isNotLoggedOrKycEd = !user || user.kyc !== 'APPROVED'; // && user.confirmed

  const isOnWrongChain = chainId !== mainnetChainId;

  const totalDelegationOfAddress = delegations.reduce((accumulator, currentDelegation) => {
    return accumulator.add(currentDelegation.stake);
  }, ethers.BigNumber.from(0));

  const totalUndelegationOfAddress = undelegations.reduce((accumulator, currentUndelegation) => {
    return accumulator.add(currentUndelegation.stake);
  }, ethers.BigNumber.from(0));

  const undelegatedTara = totalUndelegationOfAddress.gt(totalDelegationOfAddress)
    ? totalUndelegationOfAddress.sub(totalDelegationOfAddress)
    : ethers.BigNumber.from(0);

  const totalClaimableRewards = delegations.reduce((accumulator, currentDelegation) => {
    return accumulator.add(currentDelegation.rewards);
  }, ethers.BigNumber.from(0));

  const totalValidators = validators.length || -1;
  const totalDelegation = validators.reduce(
    (prev, curr) => prev.add(curr.delegation),
    ethers.BigNumber.from('0'),
  );
  const averageDelegation =
    totalValidators <= 0 ? ethers.BigNumber.from('0') : totalDelegation.div(totalValidators);

  let filteredValidators = validators;
  if (!showFullyDelegatedValidators) {
    filteredValidators = filteredValidators.filter((validator) => !validator.isFullyDelegated);
  }

  const delegatableValidators = filteredValidators.filter(
    ({ isFullyDelegated }) => !isFullyDelegated,
  );
  const fullyDelegatedValidators = filteredValidators.filter(
    ({ isFullyDelegated }) => isFullyDelegated,
  );

  const sortedValidators = sortValidators(delegatableValidators);

  return (
    <div className="runnode">
      <Modals
        balance={balance}
        claimAmount={claimAmount}
        delegateToValidator={delegateToValidator}
        undelegateFromValidator={undelegateFromValidator}
        claimRewardsFromValidator={claimRewardsFromValidator}
        showRedelegation={showPopup}
        ownDelegation={
          !!delegateToValidator &&
          delegations
            .map((d) => d.address.toLowerCase())
            .includes(delegateToValidator?.address.toLowerCase())
        }
        reDelegatableBalance={delegations
          .filter((d) => d.address.toLowerCase() === validatorFrom?.address?.toLowerCase())
          .reduce((prev, curr) => prev.add(curr.stake), ethers.BigNumber.from('0'))}
        onClaimSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
        }}
        onDelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
        }}
        onUndelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
        }}
        onReDelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
        }}
        onClaimClose={() => setClaimRewardsFromValidator(null)}
        onDelegateClose={() => setDelegateToValidator(null)}
        onReDelegateClose={() => clearRedelegation()}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onClaimFinish={() => setClaimRewardsFromValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onReDelegateFinish={() => clearRedelegation()}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
      />
      <div className="runnode-content">
        <Title title="Staking" subtitle="Earn rewards and help secure the Taraxa network." />
        {status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to connect to your Metamask wallet in order to participate in delegation."
              variant="danger"
            />
          </div>
        )}
        {isNotLoggedOrKycEd && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to be logged into your Taraxa account and pass KYC in order to delegate / un-delegate."
              variant="danger"
            />
          </div>
        )}
        {status === 'connected' && isOnWrongChain && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to be connected to the Taraxa Mainnet network in order to delegate / un-delegate."
              variant="danger"
            >
              <WrongNetwork />
            </Notification>
          </div>
        )}
        {currentBlock > 0 &&
          ownValidators
            .filter((v) => v.owner.toLowerCase() !== account?.toLowerCase())
            .some((v) => currentBlock - v.lastCommissionChange <= COMMISSION_CHANGE_THRESHOLD) && (
            <div className="notification">
              <Notification
                title="Notice:"
                text="One or more of your validators has changed their comission."
                variant="danger"
              >
                <a
                  className="commissionChangeCheck"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMyValidators(true);
                    setShowFullyDelegatedValidators(true);
                  }}
                >
                  Review the upcoming change ➞
                </a>
              </Notification>
            </div>
          )}
        {undelegations.length > 0 &&
          undelegations.map((undelegation: Undelegation) => (
            <div className="notification" key={undelegation.address}>
              <Notification
                title={
                  undelegation.block < currentBlock
                    ? `Undelegation from ${undelegation.address} has been confirmed.`
                    : `Undelegation Request from ${
                        undelegation.address
                      } has been registered and will be confirmed at block ${
                        undelegation.block
                      } (~${blocksToDays(undelegation.block - currentBlock)}). `
                }
                text={
                  undelegation.block < currentBlock
                    ? `You can claim the ${ethers.utils.commify(
                        weiToEth(undelegation.stake),
                      )} TARA.`
                    : `You can cancel the Undelegation Request to return ${ethers.utils.commify(
                        weiToEth(undelegation.stake),
                      )} TARA to validator ${undelegation.address}`
                }
                variant={undelegation.block < currentBlock ? 'success' : 'info'}
              >
                <Button
                  variant="contained"
                  color={undelegation.block < currentBlock ? 'secondary' : 'primary'}
                  label={undelegation.block < currentBlock ? 'Claim' : 'Cancel'}
                  size="small"
                  className="smallBtn"
                  onClick={() =>
                    undelegation.block < currentBlock
                      ? confirmUndelegation(undelegation)
                      : cancelUndelegation(undelegation)
                  }
                  disableElevation
                />
              </Notification>
            </div>
          ))}
        <div className="flexDiv">
          <div>
            {status === 'connected' && !isOnWrongChain && (
              <Switch
                className="switch"
                disabled={isLoading}
                name="Only show my validators"
                checked={showMyValidators}
                label="Only show my validators"
                labelPlacement="end"
                onChange={() => {
                  setShowMyValidators((v) => !v);
                }}
              />
            )}
            <Switch
              className="switch"
              disabled={isLoading}
              name="Show fully delegated nodes"
              checked={showFullyDelegatedValidators}
              label="Show fully delegated nodes"
              labelPlacement="end"
              onChange={() => {
                setShowFullyDelegatedValidators((v) => !v);
              }}
            />
          </div>
        </div>
        {validators && !showMyValidators && (
          <div className="delegationCardContainer">
            <BaseCard
              title={totalValidators !== -1 ? totalValidators.toString() : '0'}
              description="Number of network validators"
              isLoading={isLoading}
            />
            <BaseCard
              title={stripEth(averageDelegation)}
              description="Average TARA delegatated to validators"
              isLoading={isLoading}
            />
            <BaseCard
              title={stripEth(totalDelegation)}
              description="Total TARA delegated to validators"
              isLoading={isLoading}
            />
          </div>
        )}
        {!isOnWrongChain && status === 'connected' && account && (
          <div className="delegationCardContainer">
            <BaseCard
              title={`${delegations.length || 0}`}
              description="My Validators - number of validators I delegated to"
              isLoading={isLoading}
            />
            <BaseCard
              title={stripEth(totalDelegationOfAddress)}
              description="My Delegated TARA - total number of delegated tokens"
              isLoading={isLoading}
            />
            <BaseCard
              title={stripEth(totalClaimableRewards)}
              description="Claimable TARA - Staking rewards that are instantly claimable."
              isLoading={isLoading}
            />
            <BaseCard
              title={stripEth(undelegatedTara)}
              description="Undelegated TARA - TARA that is awaiting release from delegation and can be claimed or the undelegation request can be canceled."
              isLoading={isLoading}
            />
          </div>
        )}
        {filteredValidators.length === 0 && !isLoading && (
          <Text
            label="No nodes found matching the selected filters"
            variant="h6"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '20px' }}
          />
        )}
        {isLoading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem' }}
          >
            <Divider />
            <LoadingTable rows={10} cols={8} tableWidth="100%" />
          </div>
        ) : (
          filteredValidators.length > 0 && (
            <TableContainer className="validatorsTableContainer">
              <Table className="validatorsTable">
                <TableHead>
                  <TableRow>
                    <TableCell className="statusCell">
                      <TableSortLabel
                        className="sortLabel"
                        active={isSortColumnActive('status')}
                        direction={isSortColumnActive('status') ? sortOrder : 'asc'}
                        onClick={() => handleSort('status')}
                        onMouseEnter={() => hideShowDefaultSortIcon('status', true)}
                        onMouseLeave={() => hideShowDefaultSortIcon('status', false)}
                        hideSortIcon={!hideSortIcons.status && !isSortColumnActive('status')}
                      >
                        Status
                        {!hideSortIcons.status && !isSortColumnActive('status') && (
                          <MuiIcons.Remove className="dashSortIcon" />
                        )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="nameCell">Address / Nickname</TableCell>
                    <TableCell className="yieldCell">
                      <TableSortLabel
                        active={isSortColumnActive('yield')}
                        direction={isSortColumnActive('yield') ? sortOrder : 'asc'}
                        onClick={() => handleSort('yield')}
                        onMouseEnter={() => hideShowDefaultSortIcon('yield', true)}
                        onMouseLeave={() => hideShowDefaultSortIcon('yield', false)}
                        hideSortIcon={!hideSortIcons.yield && !isSortColumnActive('yield')}
                      >
                        Yield Efficiency
                        {!hideSortIcons.yield && !isSortColumnActive('yield') && (
                          <MuiIcons.Remove className="dashSortIcon" />
                        )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="commissionCell">
                      <TableSortLabel
                        active={isSortColumnActive('commission')}
                        direction={isSortColumnActive('commission') ? sortOrder : 'asc'}
                        onClick={() => handleSort('commission')}
                        onMouseEnter={() => hideShowDefaultSortIcon('commission', true)}
                        onMouseLeave={() => hideShowDefaultSortIcon('commission', false)}
                        hideSortIcon={
                          !hideSortIcons.commission && !isSortColumnActive('commission')
                        }
                      >
                        Commission
                        {!hideSortIcons.commission && !isSortColumnActive('commission') && (
                          <MuiIcons.Remove className="dashSortIcon" />
                        )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="delegationCell">
                      <TableSortLabel
                        active={isSortColumnActive('delegation')}
                        direction={isSortColumnActive('delegation') ? sortOrder : 'asc'}
                        onClick={() => handleSort('delegation')}
                        onMouseEnter={() => hideShowDefaultSortIcon('delegation', true)}
                        onMouseLeave={() => hideShowDefaultSortIcon('delegation', false)}
                        hideSortIcon={
                          !hideSortIcons.delegation && !isSortColumnActive('delegation')
                        }
                      >
                        Delegation
                        {!hideSortIcons.delegation && !isSortColumnActive('delegation') && (
                          <MuiIcons.Remove className="dashSortIcon" />
                        )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="availableDelegation">
                      <TableSortLabel
                        active={isSortColumnActive('availableForDelegation')}
                        direction={isSortColumnActive('availableForDelegation') ? sortOrder : 'asc'}
                        onClick={() => handleSort('availableForDelegation')}
                        onMouseEnter={() => hideShowDefaultSortIcon('availableForDelegation', true)}
                        onMouseLeave={() =>
                          hideShowDefaultSortIcon('availableForDelegation', false)
                        }
                        hideSortIcon={
                          !hideSortIcons.availableForDelegation &&
                          !isSortColumnActive('availableForDelegation')
                        }
                      >
                        Available for Delegation
                        {!hideSortIcons.availableForDelegation &&
                          !isSortColumnActive('availableForDelegation') && (
                            <MuiIcons.Remove className="dashSortIcon" />
                          )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell className="rewardsCell">Staking Rewards</TableCell>
                    <TableCell className="availableDelegationActionsCell">&nbsp;</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedValidators.length > 0 &&
                    sortedValidators.map((validator) => (
                      <ValidatorRow
                        key={validator.address}
                        validator={validator}
                        stakingRewards={
                          delegations.find(
                            (d) => d.address.toLowerCase() === validator.address.toLowerCase(),
                          )?.rewards || BigNumber.from('0')
                        }
                        currentBlockNumber={currentBlock}
                        actionsDisabled={status !== 'connected' || !account || isNotLoggedOrKycEd}
                        ownDelegation={delegations
                          .map((d) => d.address.toLowerCase())
                          .includes(validator.address.toLowerCase())}
                        setDelegateToValidator={setDelegateToValidator}
                        setUndelegateFromValidator={setUndelegateFromValidator}
                        setClaimFromValidator={initClaim}
                        undelegateDisabled={
                          undelegations.filter(
                            (undelegation) =>
                              undelegation.address.toLowerCase() ===
                              validator.address.toLowerCase(),
                          ).length > 0
                        }
                      />
                    ))}
                  {fullyDelegatedValidators.length > 0 && (
                    <>
                      <TableRow>
                        <TableCell className="tableSection" colSpan={8}>
                          <div className="fullyDelegatedSeparator">fully delegated</div>
                        </TableCell>
                      </TableRow>
                      {fullyDelegatedValidators.map((validator) => (
                        <ValidatorRow
                          key={validator.address}
                          validator={validator}
                          currentBlockNumber={currentBlock}
                          actionsDisabled={status !== 'connected' || !account || isNotLoggedOrKycEd}
                          stakingRewards={
                            delegations.find(
                              (d) => d.address.toLowerCase() === validator.address.toLowerCase(),
                            )?.rewards || BigNumber.from('0')
                          }
                          ownDelegation={delegations
                            .map((d) => d.address.toLowerCase())
                            .includes(validator.address.toLowerCase())}
                          setClaimFromValidator={initClaim}
                          setDelegateToValidator={setDelegateToValidator}
                          setUndelegateFromValidator={setUndelegateFromValidator}
                          undelegateDisabled={
                            undelegations.filter(
                              (undelegation) =>
                                undelegation.address.toLowerCase() ===
                                validator.address.toLowerCase(),
                            ).length > 0
                          }
                        />
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </div>
    </div>
  );
};

export default Delegation;
