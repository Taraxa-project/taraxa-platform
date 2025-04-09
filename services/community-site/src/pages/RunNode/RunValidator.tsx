import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import clsx from 'clsx';
import {
  Notification,
  Text,
  Button,
  IconCard,
  BaseCard,
  Tooltip,
  Modal,
  EmptyTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@taraxa_project/taraxa-ui';
import { useAuth } from '../../services/useAuth';
import useCMetamask from '../../services/useCMetamask';
import useMainnet from '../../services/useMainnet';
import useChain from '../../services/useChain';
import { useDelegationApi } from '../../services/useApi';

import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';

import Title from '../../components/Title/Title';
import WrongNetwork from '../../components/WrongNetwork';

import { Validator, ValidatorType } from '../../interfaces/Validator';
import { Node, nodeToValidator } from '../../interfaces/Node';

import RunValidatorModal from './Modal';
import References from './References';
import MainnetValidatorRow from './Table/MainnetValidatorRow';
import TestnetValidatorRow from './Table/TestnetValidatorRow';

import './runvalidator.scss';
import CloseIcon from '../../assets/icons/close';
import EditNode from './Screen/EditNode';
import Claim from '../Staking/Modal/Claim';
import UpdateValidator from './Screen/UpdateValidator';
import { useValidators } from '../../services/useValidators';

const RunValidator = () => {
  const auth = useAuth();
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();

  const {
    getValidatorsFor,
    allValidatorsWithStats,
    updateTestnetValidatorsStats,
    updateTestnetValidatorsRank,
  } = useValidators();
  const delegationApi = useDelegationApi();
  const networkParam = window.location.hash.replace('#', '');

  const isLoggedIn = !!auth.user?.id;
  const isOnWrongChain = chainId !== mainnetChainId;

  const [isOpenRegisterValidatorModal, setIsOpenRegisterValidatorModal] = useState(false);

  const openRegisterValidatorModal = () => {
    setIsOpenRegisterValidatorModal(true);
  };

  const closeRegisterValidatorModal = () => {
    setIsOpenRegisterValidatorModal(false);
  };

  const [validatorType, setValidatorType] = useState<ValidatorType>(
    networkParam === ValidatorType.TESTNET || networkParam === ValidatorType.MAINNET
      ? networkParam
      : ValidatorType.MAINNET,
  );
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [mainnetValidators, setMainnetValidators] = useState<Validator[]>([]);
  const [testnetValidators, setTestnetValidators] = useState<Validator[]>([]);
  const [validatorToUpdate, setValidatorToUpdate] = useState<Validator | null>(null);
  const [validatorToClaimFrom, setValidatorToClaimFrom] = useState<Validator | null>(null);
  const [fetchCounter, setFetchCounter] = useState<number>(0);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | Validator>(null);

  const fetchBalance = async () => {
    if (status === 'connected' && account && provider) {
      setBalance(await provider.getBalance(account));
    }
  };

  const getTestnetNodes = useCallback(async () => {
    try {
      const r = await delegationApi.get(`/nodes?type=testnet`, true);
      if (r.success) {
        const testnetNodes: Node[] = r.response;
        const testnetValidators = testnetNodes.map((n) => nodeToValidator(n));
        setTestnetValidators(testnetValidators);
        const updatedValidators = await updateTestnetValidatorsRank(testnetValidators);
        const validatorsWithStats = await updateTestnetValidatorsStats(updatedValidators);
        setTestnetValidators(validatorsWithStats);
      } else {
        setTestnetValidators([]);
      }
    } catch (err) {
      setTestnetValidators([]);
    }
  }, [validatorType]);

  const deleteTestnetNode = async (node: Validator) => {
    await delegationApi.del(`/nodes/${node.id}`, true);
    await getTestnetNodes();
  };

  useEffect(() => {
    const intervalBalancePeriod = 8000;
    const intervalFetchBalance = setInterval(() => {
      fetchBalance();
    }, intervalBalancePeriod);
    return () => {
      clearInterval(intervalFetchBalance);
    };
  }, [status, account, chainId, fetchCounter]);

  useEffect(() => {
    (async () => {
      if (validatorType === ValidatorType.TESTNET) {
        await getTestnetNodes();
      }
    })();
  }, [fetchCounter, validatorType]);

  const fetchValidators = () => {
    if (status === 'connected' && account && validatorType === ValidatorType.MAINNET) {
      (async () => {
        const myValidators = await getValidatorsFor(account);
        const validatorsWithYieldEfficiency: Validator[] = myValidators.map((v) => {
          const foundValidator = allValidatorsWithStats.find(
            (validatorWithStats) => validatorWithStats.address === v.address,
          );
          return {
            ...v,
            ...foundValidator,
          } as Validator;
        });
        setMainnetValidators(validatorsWithYieldEfficiency);
      })();
    }
  };

  useEffect(() => {
    fetchValidators();
  }, [status, account, fetchCounter, validatorType, allValidatorsWithStats]);

  const nodeTypeLabel = validatorType === ValidatorType.MAINNET ? 'Mainnet' : 'Testnet';

  let canRegisterValidator = false;

  if (validatorType === ValidatorType.MAINNET) {
    if (!isOnWrongChain) {
      if (status === 'connected') {
        if (account) {
          canRegisterValidator = true;
        }
      }
    }
  }

  if (validatorType === ValidatorType.TESTNET) {
    if (isLoggedIn) {
      canRegisterValidator = true;
    }
  }

  let activeValidators = 0;
  let blocksProduced = 0;
  let weeklyRating = 0;

  if (validatorType === ValidatorType.MAINNET) {
    activeValidators = mainnetValidators.filter((v) => v.isActive).length;
  }

  if (validatorType === ValidatorType.TESTNET) {
    activeValidators = testnetValidators.filter((v) => v.isActive).length;
    blocksProduced = testnetValidators.reduce((prev, curr) => prev + curr.pbftsProduced!, 0);
    weeklyRating = 0;
  }

  const setValidatorInfo = (validator: Validator) => {
    setValidatorToUpdate(validator);
  };

  if (currentEditedNode) {
    return (
      <EditNode
        node={currentEditedNode}
        closeEditNode={(refreshNodes) => {
          setCurrentEditedNode(null);
          if (refreshNodes) {
            getTestnetNodes();
          }
        }}
      />
    );
  }

  if (validatorToUpdate) {
    return (
      <UpdateValidator
        validator={validatorToUpdate}
        closeEditValidator={(refreshValidators) => {
          setValidatorToUpdate(null);
          if (refreshValidators) {
            fetchValidators();
          }
        }}
      />
    );
  }

  return (
    <div className="runnode">
      {validatorToClaimFrom && (
        <Modal
          id="delegateModal"
          title="Claim from..."
          show={!!validatorToClaimFrom}
          children={
            <Claim
              amount={validatorToClaimFrom.commissionReward}
              validator={validatorToClaimFrom}
              onSuccess={() => setValidatorToClaimFrom(null)}
              onFinish={() => setValidatorToClaimFrom(null)}
              commissionMode
            />
          }
          parentElementID="root"
          onRequestClose={() => setValidatorToClaimFrom(null)}
          closeIcon={CloseIcon}
        />
      )}
      <RunValidatorModal
        balance={balance}
        isOpen={isOpenRegisterValidatorModal}
        validatorType={validatorType}
        onClose={() => closeRegisterValidatorModal()}
        onSuccess={() => {
          setFetchCounter((prev) => prev + 1);
          closeRegisterValidatorModal();
        }}
      />
      <div className="runnode-content">
        {validatorType === ValidatorType.MAINNET && status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You meed to connect to your Metamask wallet in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {validatorType === ValidatorType.MAINNET && status === 'connected' && isOnWrongChain && (
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
        {validatorType === ValidatorType.TESTNET && !isLoggedIn && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to sign in or sign up for a new account in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        <Title title="Running a Node" />
        <div className="nodeTypes">
          <div className="nodeTitleContainer">
            <NodeIcon />
            <Text label="My nodes" variant="h6" color="primary" className="box-title" />
            <Button
              size="small"
              className={clsx('nodeTypeTab', validatorType === ValidatorType.MAINNET && 'active')}
              label="Mainnet"
              variant="contained"
              onClick={() => {
                setValidatorType(ValidatorType.MAINNET);
                window.location.hash = ValidatorType.MAINNET;
              }}
            />
            <Button
              size="small"
              className={clsx('nodeTypeTab', validatorType === ValidatorType.TESTNET && 'active')}
              label="Testnet"
              variant="contained"
              onClick={() => {
                setValidatorType(ValidatorType.TESTNET);
                window.location.hash = ValidatorType.TESTNET;
              }}
            />
          </div>
          <Button
            size="small"
            className="registerNode"
            label={`Register a ${nodeTypeLabel} node`}
            variant="contained"
            color="secondary"
            disabled={!canRegisterValidator}
            onClick={() => openRegisterValidatorModal()}
          />
        </div>
        <div className="cardContainer">
          {((validatorType === ValidatorType.MAINNET && mainnetValidators.length > 0) ||
            (validatorType === ValidatorType.TESTNET && testnetValidators.length > 0)) && (
            <>
              <BaseCard
                title={activeValidators.toString()}
                description="Active nodes"
                tooltip={
                  <Tooltip
                    title="A node is considered active if it produced at least one block in the last 24 hours."
                    Icon={InfoIcon}
                  />
                }
              />
              <BaseCard title={blocksProduced.toString()} description="Blocks produced" />
              <BaseCard
                title={weeklyRating.toString()}
                description="Weekly block production ranking of your top node"
              />
            </>
          )}
          {((validatorType === ValidatorType.MAINNET && mainnetValidators.length === 0) ||
            (validatorType === ValidatorType.TESTNET && testnetValidators.length === 0)) && (
            <>
              <IconCard
                title="Register a node"
                description="Register a node you’ve aleady set up."
                onClickText={`Register a ${nodeTypeLabel} node`}
                onClickButton={() => openRegisterValidatorModal()}
                Icon={NodeIcon}
                disabled={!canRegisterValidator}
              />
              <IconCard
                title="Set up a node"
                description="Learn how to set up a node on Taraxa’s testnet."
                onClickText="Set up a node"
                onClickButton={() =>
                  window.open(
                    'https://docs.taraxa.io/node-setup/testnet_node_setup',
                    '_blank',
                    'noreferrer noopener',
                  )
                }
                Icon={NodeIcon}
              />
            </>
          )}
        </div>
        {validatorType === ValidatorType.MAINNET && (
          <TableContainer className="validatorsTableContainer">
            <Table className="validatorsTable">
              <TableHead>
                <TableRow>
                  <TableCell className="statusCell">Status</TableCell>
                  <TableCell className="nameCell">Address / Nickname</TableCell>
                  <TableCell className="yieldCell">Yield Efficiency</TableCell>
                  <TableCell className="commissionCell">Commission</TableCell>
                  <TableCell className="delegationCell">Delegation</TableCell>
                  <TableCell className="availableDelegation">Available for Delegation</TableCell>
                  <TableCell className="rankingCell">Ranking</TableCell>
                  <TableCell className="rewardsCell">Commission Rewards</TableCell>
                  <TableCell className="actionsCell">&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainnetValidators.length > 0 ? (
                  mainnetValidators.map((v: Validator) => (
                    <MainnetValidatorRow
                      key={v.address}
                      validator={v}
                      actionsDisabled={status !== 'connected' || !account}
                      setValidatorInfo={setValidatorInfo}
                      setCommissionClaim={setValidatorToClaimFrom}
                    />
                  ))
                ) : (
                  <EmptyTable
                    colspan={9}
                    message="Looks like you haven`t registered any mainnet validators yet..."
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {validatorType === ValidatorType.TESTNET && (
          <TableContainer className="validatorsTableContainer">
            <Table className="validatorsTable">
              <TableHead>
                <TableRow>
                  <TableCell className="statusCell">Status</TableCell>
                  <TableCell className="nameCell">Name</TableCell>
                  <TableCell className="yieldCell">Expected Yield</TableCell>
                  <TableCell className="pbftsCell">Number of blocks produced</TableCell>
                  <TableCell className="rankingCell">Ranking</TableCell>
                  <TableCell className="actionsCell">&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testnetValidators.length > 0 ? (
                  testnetValidators.map((v: Validator) => (
                    <TestnetValidatorRow
                      key={v.address}
                      validator={v}
                      onEdit={setCurrentEditedNode}
                      onDelete={deleteTestnetNode}
                    />
                  ))
                ) : (
                  <EmptyTable
                    colspan={6}
                    message="Looks like you haven`t registered any testnet validators yet..."
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <References
          canRegisterValidator={canRegisterValidator}
          openRegisterValidatorModal={() => openRegisterValidatorModal()}
        />
      </div>
    </div>
  );
};

export default RunValidator;
