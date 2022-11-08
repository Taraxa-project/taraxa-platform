import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
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
} from '@taraxa_project/taraxa-ui';

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

import { weiToEth } from '../../utils/eth';

const Delegation = ({ location }: { location: Location }) => {
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();

  const { getValidators, getValidatorsWith } = useValidators();
  const { updateValidatorsStats } = useExplorerStats();
  const { getDelegations, getUndelegations, confirmUndelegate } = useDelegation();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<DelegationInterface[]>([]);
  const [undelegations, setUndelegations] = useState<UndelegationInterface[]>([]);

  const showMyValidatorsQuery =
    new URLSearchParams(location.search).get('show_my_validators') !== null;
  const [showMyValidators, setShowMyValidators] = useState(showMyValidatorsQuery || false);
  const [showFullyDelegatedValidators, setShowFullyDelegatedValidators] = useState(true);

  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);

  useEffect(() => {
    (async () => {
      if (status === 'connected' && account && provider) {
        setBalance(await provider.getBalance(account));
      }
    })();
  }, [status, account, provider]);

  useEffect(() => {
    if (status === 'connected' && account) {
      (async () => {
        setDelegations(await getDelegations(account));
      })();
    }
  }, [status, account]);

  useEffect(() => {
    if (status === 'connected' && account && provider) {
      (async () => {
        const latestBlock = await provider.getBlockNumber();
        const un = await getUndelegations(account);
        setUndelegations(un.filter((u) => u.block < latestBlock));
      })();
    }
  }, [status, account]);

  useEffect(() => {
    (async () => {
      let v;
      if (showMyValidators) {
        v = await getValidatorsWith(delegations.map((d) => d.address));
      } else {
        v = await getValidators();
      }
      setValidators(v);

      const validatorsWithStats = await updateValidatorsStats(v);
      setValidators(validatorsWithStats);
    })();
  }, [showMyValidators, delegations]);

  const isOnWrongChain = chainId !== mainnetChainId;

  const totalValidators = validators.length;
  const totalDelegation = validators.reduce(
    (prev, curr) => prev.add(curr.delegation),
    ethers.BigNumber.from('0'),
  );
  const averageDelegation =
    totalValidators === 0 ? ethers.BigNumber.from('0') : totalDelegation.div(totalValidators);

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
        undelegateFromValidator={undelegateFromValidator}
        onDelegateSuccess={() => {
          // getBalances();
          // getValidators();
          // getStats();
        }}
        onUndelegateSuccess={() => {
          // getBalances();
          // getValidators();
          // getStats();
        }}
        onDelegateClose={() => setDelegateToValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
      />
      <div className="runnode-content">
        <Title title="Delegation" />
        {status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You meed to connect to your Metamask wallet in order to participate in delegation."
              variant="danger"
            />
          </div>
        )}
        {status === 'connected' && isOnWrongChain && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You meed to be connected to the Taraxa Mainnet network in order to delegate / un-delegate."
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
                title={`Undelegation from ${undelegation.address} has been confirmed.`}
                text={`You can claim the ${ethers.utils.commify(
                  weiToEth(undelegation.stake),
                )} TARA or re-delegate it.`}
                variant="success"
              >
                <Button
                  variant="contained"
                  color="primary"
                  label="Claim"
                  size="small"
                  onClick={() => confirmUndelegate(undelegation.address)}
                  disableElevation
                />
                <Button
                  variant="contained"
                  color="secondary"
                  label="Re-delegate"
                  size="small"
                  onClick={() => confirmUndelegate(undelegation.address)}
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
        {totalValidators > 0 && (
          <div className="cardContainer">
            <BaseCard
              title={totalValidators.toString()}
              description="Number of network validators"
            />
            <BaseCard
              title={ethers.utils.commify(weiToEth(averageDelegation))}
              description="Average TARA delegatated to validators"
            />
            <BaseCard
              title={ethers.utils.commify(weiToEth(totalDelegation))}
              description="Total TARA delegated to validators"
            />
          </div>
        )}
        {filteredValidators.length === 0 && (
          <Text
            label="No nodes found matching the selected filters"
            variant="h6"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '20px' }}
          />
        )}
        {filteredValidators.length > 0 && (
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
                        setDelegateToValidator={setDelegateToValidator}
                        setUndelegateFromValidator={setUndelegateFromValidator}
                      />
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default Delegation;
