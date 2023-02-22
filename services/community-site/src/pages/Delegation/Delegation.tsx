import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  CircularProgress,
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
  Card,
  Icons,
  BaseCard,
  useInterval,
  Label,
} from '@taraxa_project/taraxa-ui';

import { useLoading } from '../../services/useLoading';
import Title from '../../components/Title/Title';
import WrongNetwork from '../../components/WrongNetwork';

import useCMetamask from '../../services/useCMetamask';
import useMainnet from '../../services/useMainnet';
import useValidators from '../../services/useValidators';
import useExplorerStats from '../../services/useExplorerStats';
import useDelegation from '../../services/useDelegation';
import useChain from '../../services/useChain';

import Modals from './Modal/Modals';
import ValidatorRow from './Table/ValidatorRow';

import './delegation.scss';
import { Validator } from '../../interfaces/Validator';
import DelegationInterface from '../../interfaces/Delegation';
import UndelegationInterface from '../../interfaces/Undelegation';

import { stripEth, weiToEth } from '../../utils/eth';

const Delegation = ({ location }: { location: Location }) => {
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();
  const { isLoading } = useLoading();

  const { getValidators, getValidatorsWith } = useValidators();
  const { updateValidatorsStats } = useExplorerStats();
  const { getDelegations, getUndelegations, confirmUndelegate, cancelUndelegate } = useDelegation();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<DelegationInterface[]>([]);
  const [undelegations, setUndelegations] = useState<UndelegationInterface[]>([]);

  const showMyValidatorsQuery =
    new URLSearchParams(location.search).get('show_my_validators') !== null;
  const [showMyValidators, setShowMyValidators] = useState(showMyValidatorsQuery || false);
  const [showFullyDelegatedValidators, setShowFullyDelegatedValidators] = useState(true);

  const [isLoadingAccountData, setLoadingAccountData] = useState(false);

  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [currentBlock, setCurrentBlock] = useState(0);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
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
  useEffect(() => {
    fetchBalance();
  }, [status, account, chainId, shouldFetch]);

  useInterval(async () => {
    fetchBalance();
    getCurrentBlock();
  }, 15000);

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
    (async () => {
      setLoadingAccountData(true);
      let v;
      if (showMyValidators) {
        v = await getValidatorsWith(delegations.map((d) => d.address));
      } else {
        v = await getValidators();
      }
      setValidators(v);

      const validatorsWithStats = await updateValidatorsStats(v);
      setValidators(validatorsWithStats);
      setLoadingAccountData(false);
    })();
  }, [showMyValidators, delegations, shouldFetch]);

  const isOnWrongChain = chainId !== mainnetChainId;

  const totalDelegationOfAddress = delegations.reduce((accumulator, currentDelegation) => {
    return accumulator.add(currentDelegation.stake);
  }, ethers.BigNumber.from(0));

  const totalUndelegationOfAddress = undelegations.reduce((accumulator, currentUndelegation) => {
    return accumulator.add(currentUndelegation.stake);
  }, ethers.BigNumber.from(0));

  const claimableTara = totalUndelegationOfAddress.gt(totalDelegationOfAddress)
    ? totalUndelegationOfAddress.sub(totalDelegationOfAddress)
    : ethers.BigNumber.from(0);

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
        delegateToValidator={delegateToValidator}
        reDelegateFromValidator={reDelegateFromValidator}
        undelegateFromValidator={undelegateFromValidator}
        delegatableValidators={delegatableValidators?.filter(
          (d) => d.address !== reDelegateFromValidator?.address,
        )}
        reDelegatableBalance={delegations
          .filter(
            (d) => d.address.toLowerCase() === reDelegateFromValidator?.address?.toLowerCase(),
          )
          .reduce((prev, curr) => prev.add(curr.stake), ethers.BigNumber.from('0'))}
        onDelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
          // getStats();
        }}
        onUndelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
          // getStats();
        }}
        onReDelegateSuccess={() => {
          fetchBalance();
          getValidators();
          setShouldFetch(true);
        }}
        onDelegateClose={() => setDelegateToValidator(null)}
        onReDelegateClose={() => setReDelegateFromValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onReDelegateFinish={() => setReDelegateFromValidator(null)}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
      />
      <div className="runnode-content">
        <Title title="Delegation" />
        {status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to connect to your Metamask wallet in order to participate in delegation."
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
        {/* {ownValidatorsHaveCommissionChange && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="One of more of your validators has changed their comission."
              variant="danger"
            >
              <a
                className="commissionChangeCheck"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowUserOwnValidators(true);
                  setShowFullyDelegatedNodes(true);
                }}
              >
                Review the upcoming change ➞
              </a>
            </Notification>
          </div>
        )} */}
        {undelegations.length > 0 &&
          undelegations.map((undelegation: UndelegationInterface) => (
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
                  size="medium"
                  style={{ minWidth: '150px' }}
                  onClick={() =>
                    undelegation.block < currentBlock
                      ? confirmUndelegate(undelegation.address)
                      : cancelUndelegate(undelegation.address)
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
              name="Show fully delegated nodes"
              checked={showFullyDelegatedValidators}
              label="Show fully delegated nodes"
              labelPlacement="end"
              onChange={() => {
                setShowFullyDelegatedValidators((v) => !v);
              }}
            />
          </div>
          <div>
            <Card className="trophyLegend">
              <Box>
                <Icons.Trophy /> Multiple weeks winner of the testnet block producer challenge
              </Box>
            </Card>
          </div>
        </div>
        {validators && (
          <div className="cardContainer">
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
          <div className="cardContainer">
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
              title={stripEth(claimableTara)}
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
        {isLoadingAccountData ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem' }}
          >
            <Divider />
            <Label
              variant="loading"
              label="Loading"
              gap
              icon={<CircularProgress size={50} color="inherit" />}
            />
          </div>
        ) : (
          filteredValidators.length > 0 && (
            <TableContainer>
              <Table className="table">
                <TableHead>
                  <TableRow className="tableHeadRow">
                    <TableCell className="tableHeadCell statusCell">Status</TableCell>
                    <TableCell className="tableHeadCell nameCell">Name</TableCell>
                    <TableCell className="tableHeadCell yieldCell">Yield, %</TableCell>
                    <TableCell className="tableHeadCell commissionCell">Commission</TableCell>
                    <TableCell className="tableHeadCell delegationCell">Delegation</TableCell>
                    <TableCell className="tableHeadCell availableDelegationActionsCell">
                      Available for Delegation
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delegatableValidators.length > 0 &&
                    delegatableValidators.map((validator) => (
                      <ValidatorRow
                        key={validator.address}
                        validator={validator}
                        actionsDisabled={status !== 'connected' || !account}
                        ownDelegation={delegations
                          .map((d) => d.address.toLowerCase())
                          .includes(validator.address.toLowerCase())}
                        setReDelegateFromValidator={setReDelegateFromValidator}
                        setDelegateToValidator={setDelegateToValidator}
                        setUndelegateFromValidator={setUndelegateFromValidator}
                      />
                    ))}
                  {fullyDelegatedValidators.length > 0 && (
                    <>
                      <TableRow className="tableRow">
                        <TableCell className="tableCell tableSection" colSpan={6}>
                          <div className="fullyDelegatedSeparator">fully delegated</div>
                        </TableCell>
                      </TableRow>
                      {fullyDelegatedValidators.map((validator) => (
                        <ValidatorRow
                          key={validator.address}
                          validator={validator}
                          actionsDisabled={status !== 'connected' || !account}
                          ownDelegation={delegations
                            .map((d) => d.address.toLowerCase())
                            .includes(validator.address.toLowerCase())}
                          setReDelegateFromValidator={setReDelegateFromValidator}
                          setDelegateToValidator={setDelegateToValidator}
                          setUndelegateFromValidator={setUndelegateFromValidator}
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
