import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Text,
  Notification,
  Button,
  Switch,
  BaseCard,
  useInterval,
  LoadingTable,
} from '@taraxa_project/taraxa-ui';

import { useAuth } from '../../services/useAuth';
import useExplorerStats from '../../services/useExplorerStats';
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

const Delegation = ({ location }: { location: Location }) => {
  const { user } = useAuth();
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();
  const { isLoading } = useLoading();
  const { asyncCallback } = useWalletPopup();

  const { getValidators, getValidatorsWith } = useValidators();
  const { updateValidatorsStats } = useExplorerStats();
  const { getDelegations, getUndelegations, confirmUndelegate, cancelUndelegate } = useDelegation();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [ownValidators, setOwnValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<DelegationInterface[]>([]);
  const [undelegations, setUndelegations] = useState<Undelegation[]>([]);

  const showMyValidatorsQuery =
    new URLSearchParams(location.search).get('show_my_validators') !== null;
  const [showMyValidators, setShowMyValidators] = useState(showMyValidatorsQuery || false);
  const [showFullyDelegatedValidators, setShowFullyDelegatedValidators] = useState(true);

  const [isLoadingAccountData, setLoadingAccountData] = useState(false);

  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [claimAmount, setClaimAmount] = useState(ethers.BigNumber.from('0'));
  const [currentBlock, setCurrentBlock] = useState(0);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [claimRewardsFromValidator, setClaimRewardsFromValidator] = useState<Validator | null>(
    null,
  );
  const [reDelegateFromValidator, setReDelegateFromValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

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
        setLoadingAccountData(true);
        setDelegations(await getDelegations(account));
        setLoadingAccountData(false);
      })();
    }
  }, [status, account, chainId, shouldFetch]);

  useEffect(() => {
    if (status === 'connected' && account && provider) {
      (async () => {
        setLoadingAccountData(true);
        const unDelegations = await getUndelegations(account);
        setUndelegations(unDelegations);
        setLoadingAccountData(false);
      })();
    }
  }, [status, account, chainId, shouldFetch]);

  useEffect(() => {
    if (delegations.length > 0) {
      (async () => {
        setLoadingAccountData(true);
        const myValidators = await getValidatorsWith(delegations.map((d) => d.address));
        setOwnValidators(myValidators);
        setLoadingAccountData(false);
      })();
    }
  }, [delegations]);

  useEffect(() => {
    (async () => {
      let v;
      if (showMyValidators) {
        v = ownValidators || [];
      } else {
        setLoadingAccountData(true);
        v = await getValidators();
        setLoadingAccountData(false);
      }
      setValidators(v);
      const validatorsWithStats = await updateValidatorsStats(v);
      setValidators(validatorsWithStats);
    })();
  }, [showMyValidators, ownValidators]);

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

  return (
    <div className="runnode">
      <Modals
        balance={balance}
        claimAmount={claimAmount}
        delegateToValidator={delegateToValidator}
        reDelegateFromValidator={reDelegateFromValidator}
        undelegateFromValidator={undelegateFromValidator}
        claimRewardsFromValidator={claimRewardsFromValidator}
        delegatableValidators={delegatableValidators?.filter(
          (d) => d.address !== reDelegateFromValidator?.address,
        )}
        ownDelegation={
          !!delegateToValidator &&
          delegations
            .map((d) => d.address.toLowerCase())
            .includes(delegateToValidator?.address.toLowerCase())
        }
        reDelegatableBalance={delegations
          .filter(
            (d) => d.address.toLowerCase() === reDelegateFromValidator?.address?.toLowerCase(),
          )
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
        onReDelegateClose={() => setReDelegateFromValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onClaimFinish={() => setClaimRewardsFromValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onReDelegateFinish={() => setReDelegateFromValidator(null)}
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
                    : `Undelegation Request from ${undelegation.address} has been registered and will be confirmed at block ${undelegation.block}.`
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
                disabled={isLoadingAccountData || isLoading}
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
              disabled={isLoadingAccountData || isLoading}
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
              isLoading={totalValidators === -1}
            />
            <BaseCard
              title={stripEth(averageDelegation)}
              description="Average TARA delegatated to validators"
              isLoading={totalValidators === -1}
            />
            <BaseCard
              title={stripEth(totalDelegation)}
              description="Total TARA delegated to validators"
              isLoading={totalValidators === -1}
            />
          </div>
        )}
        {!isOnWrongChain && status === 'connected' && account && (
          <div className="delegationCardContainer">
            <BaseCard
              title={`${delegations.length || 0}`}
              description="My Validators - number of validators I delegated to"
              isLoading={isLoadingAccountData}
            />
            <BaseCard
              title={stripEth(totalDelegationOfAddress)}
              description="My Delegated TARA - total number of delegated tokens"
              isLoading={isLoadingAccountData}
            />
            <BaseCard
              title={stripEth(totalClaimableRewards)}
              description="Claimable TARA - Staking rewards that are instantly claimable."
              isLoading={isLoadingAccountData}
            />
            <BaseCard
              title={stripEth(undelegatedTara)}
              description="Undelegated TARA - TARA that is awaiting release from delegation and can be claimed or the undelegation request can be canceled."
              isLoading={isLoadingAccountData}
            />
          </div>
        )}
        {filteredValidators.length === 0 && !isLoadingAccountData && !isLoading && (
          <Text
            label="No nodes found matching the selected filters"
            variant="h6"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '20px' }}
          />
        )}
        {isLoadingAccountData || isLoading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem' }}
          >
            <Divider />
            <LoadingTable rows={10} cols={8} tableWidth="100%" />
          </div>
        ) : (
          filteredValidators.length > 0 && (
            <TableContainer className="delegationTableContainer">
              <Table className="delegationTable">
                <TableHead>
                  <TableRow className="tableHeadRow">
                    <TableCell className="tableHeadCell statusCell">Status</TableCell>
                    <TableCell className="tableHeadCell nameCell">Nickname</TableCell>
                    <TableCell className="tableHeadCell yieldCell">Yield Ratio</TableCell>
                    <TableCell className="tableHeadCell commissionCell">Commission</TableCell>
                    <TableCell className="tableHeadCell delegationCell">Delegation</TableCell>
                    <TableCell className="tableHeadCell delegationCell">
                      Available for Delegation
                    </TableCell>
                    <TableCell className="tableHeadCell stackingCell">Staking Rewards</TableCell>
                    <TableCell className="tableHeadCell availableDelegationActionsCell">
                      &nbsp;
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delegatableValidators.length > 0 &&
                    delegatableValidators.map((validator) => (
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
                        // setReDelegateFromValidator={setReDelegateFromValidator}
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
                      <TableRow className="tableRow">
                        <TableCell className="tableCell tableSection" colSpan={8}>
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
                          // setReDelegateFromValidator={setReDelegateFromValidator}
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
