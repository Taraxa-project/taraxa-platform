import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import clsx from 'clsx';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {
  Notification,
  Text,
  Button,
  IconCard,
  BaseCard,
  Tooltip,
  Modal,
} from '@taraxa_project/taraxa-ui';

import { useAuth } from '../../services/useAuth';
import useCMetamask from '../../services/useCMetamask';
import useMainnet from '../../services/useMainnet';
import useChain from '../../services/useChain';
import { useDelegationApi } from '../../services/useApi';
import useValidators from '../../services/useValidators';
import useDelegation from '../../services/useDelegation';

import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';

import Title from '../../components/Title/Title';
import WrongNetwork from '../../components/WrongNetwork';

import { Validator } from '../../interfaces/Validator';
import Delegation from '../../interfaces/Delegation';
import OwnNode from '../../interfaces/OwnNode';

import RunValidatorModal from './Modal';
import References from './References';
import MainnetValidatorRow from './Table/MainnetValidatorRow';
import TestnetValidatorRow from './Table/TestnetValidatorRow';

import './runvalidator.scss';
import CloseIcon from '../../assets/icons/close';
import EditNode from './Screen/EditNode';
import Claim from '../Staking/Modal/Claim';
import UpdateValidator from './Screen/UpdateValidator';
import useExplorerStats from '../../services/useExplorerStats';

const RunValidator = () => {
  const auth = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getValidatorsWith, getValidatorsFor } = useValidators();
  const { updateValidatorsRank, updateValidatorsStats } = useExplorerStats();
  const delegationApi = useDelegationApi();
  const { getDelegations } = useDelegation();

  const isLoggedIn = !!auth.user?.id;
  const isOnWrongChain = chainId !== mainnetChainId;

  const [isOpenRegisterValidatorModal, setIsOpenRegisterValidatorModal] = useState(false);

  const openRegisterValidatorModal = () => {
    setIsOpenRegisterValidatorModal(true);
  };

  const closeRegisterValidatorModal = () => {
    setIsOpenRegisterValidatorModal(false);
  };

  const [validatorType, setValidatorType] = useState<'mainnet' | 'testnet'>('mainnet');
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [mainnetValidators, setMainnetValidators] = useState<Validator[]>([]);
  const [testnetValidators, setTestnetValidators] = useState<OwnNode[]>([]);
  const [delegations, setDelegations] = useState<Delegation[] | null>(null);
  const [validatorToUpdate, setValidatorToUpdate] = useState<Validator | null>(null);
  const [validatorToClaimFrom, setValidatorToClaimFrom] = useState<Validator | null>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | OwnNode>(null);

  const fetchBalance = async () => {
    if (status === 'connected' && account && provider) {
      setBalance(await provider.getBalance(account));
    }
  };

  const getTestnetNodes = () => {
    delegationApi
      .get(`/nodes?type=testnet`, true)
      .then((r) => {
        if (r.success) {
          setTestnetValidators(r.response);
        } else {
          setTestnetValidators([]);
        }
      })
      .catch(() => setTestnetValidators([]));
  };

  const deleteTestnetNode = async (node: OwnNode) => {
    await delegationApi.del(`/nodes/${node.id}`, true);
    getTestnetNodes();
  };

  useEffect(() => {
    const intervalBalancePeriod = 8000;
    const intervalFetchBalance = setInterval(() => {
      fetchBalance();
    }, intervalBalancePeriod);
    return () => {
      clearInterval(intervalFetchBalance);
    };
  }, [status, account, chainId, shouldFetch]);

  useEffect(() => {
    getTestnetNodes();
  }, []);

  useEffect(() => {
    if (status === 'connected' && account) {
      (async () => {
        setDelegations(await getDelegations(account));
      })();
    }
  }, [status, account, shouldFetch]);

  const fetchValidators = () => {
    if (status === 'connected' && account && delegations?.length === 0) {
      (async () => {
        const myValidators = await getValidatorsFor(account);
        const validatorsWithStats = await updateValidatorsStats(myValidators);
        const updatedValidators = await updateValidatorsRank(validatorsWithStats);
        setMainnetValidators(updatedValidators);
      })();
    }
  };

  useEffect(() => {
    fetchValidators();
  }, [status, account, shouldFetch, delegations]);

  useEffect(() => {
    if (status === 'connected' && account && delegations && delegations.length > 0) {
      (async () => {
        const mainnetValidators = await getValidatorsWith(delegations.map((d) => d.address));
        const myValidators = mainnetValidators.filter(
          (validator) => validator.owner.toLowerCase() === account.toLowerCase(),
        );
        const validatorsWithStats = await updateValidatorsStats(myValidators);
        const updatedValidators = await updateValidatorsRank(validatorsWithStats);
        setMainnetValidators(updatedValidators);
      })();
    }
  }, [status, account, delegations, shouldFetch]);

  const nodeTypeLabel = validatorType === 'mainnet' ? 'Mainnet' : 'Testnet';

  let canRegisterValidator = false;

  if (validatorType === 'mainnet') {
    if (!isOnWrongChain) {
      if (status === 'connected') {
        if (account) {
          canRegisterValidator = true;
        }
      }
    }
  }

  if (validatorType === 'testnet') {
    if (isLoggedIn) {
      canRegisterValidator = true;
    }
  }

  let activeValidators = 0;
  let blocksProduced = 0;
  let weeklyRating = 0;

  if (validatorType === 'mainnet') {
    activeValidators = mainnetValidators.filter((v) => v.isActive).length;
  }

  if (validatorType === 'testnet') {
    activeValidators = testnetValidators.filter((v) => v.isActive).length;
    blocksProduced = testnetValidators.reduce((prev, curr) => prev + curr.blocksProduced!, 0);
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
          // getNodes();
          setShouldFetch(true);
          closeRegisterValidatorModal();
        }}
      />
      <div className="runnode-content">
        {validatorType === 'mainnet' && status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You meed to connect to your Metamask wallet in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {validatorType === 'mainnet' && status === 'connected' && isOnWrongChain && (
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
        {validatorType === 'testnet' && !isLoggedIn && (
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
              className={clsx('nodeTypeTab', validatorType === 'mainnet' && 'active')}
              label="Mainnet"
              variant="contained"
              onClick={() => {
                setValidatorType('mainnet');
              }}
            />
            <Button
              size="small"
              className={clsx('nodeTypeTab', validatorType === 'testnet' && 'active')}
              label="Testnet"
              variant="contained"
              onClick={() => {
                setValidatorType('testnet');
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
          {((validatorType === 'mainnet' && mainnetValidators.length > 0) ||
            (validatorType === 'testnet' && testnetValidators.length > 0)) && (
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
          {((validatorType === 'mainnet' && mainnetValidators.length === 0) ||
            (validatorType === 'testnet' && testnetValidators.length === 0)) && (
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
        {validatorType === 'mainnet' && mainnetValidators.length > 0 && (
          <TableContainer className="nodesTableContainer">
            <Table className="nodesTable">
              <TableHead>
                <TableRow className="tableHeadRow">
                  <TableCell className="tableHeadCell statusCell">Status</TableCell>
                  <TableCell className="tableHeadCell nameCell">Name</TableCell>
                  <TableCell className="tableHeadCell yieldCell">Expected Yield</TableCell>
                  <TableCell className="tableHeadCell commissionCell">Commission</TableCell>
                  <TableCell className="tableHeadCell delegationCell">Delegation</TableCell>
                  <TableCell className="tableHeadCell availableDelegation">
                    Available for Delegation
                  </TableCell>
                  <TableCell className="tableHeadCell rankingCell">Ranking</TableCell>
                  <TableCell className="tableHeadCell rewardsCell">Comission Rewards</TableCell>
                  <TableCell className="tableHeadCell actionsCell">&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainnetValidators.map((v: Validator) => (
                  <MainnetValidatorRow
                    key={v.address}
                    validator={v}
                    actionsDisabled={status !== 'connected' || !account}
                    setValidatorInfo={setValidatorInfo}
                    setCommissionClaim={setValidatorToClaimFrom}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {validatorType === 'testnet' && testnetValidators.length > 0 && (
          <TableContainer>
            <Table className="table">
              <TableHead>
                <TableRow className="tableHeadRow">
                  <TableCell className="tableHeadCell statusCell">Status</TableCell>
                  <TableCell className="tableHeadCell nodeCell">Name</TableCell>
                  <TableCell className="tableHeadCell nodeCell">Expected Yield</TableCell>
                  <TableCell className="tableHeadCell nodeCell">
                    Number of blocks produced
                  </TableCell>
                  <TableCell className="tableHeadCell nodeCell" colSpan={2}>
                    Ranking
                  </TableCell>
                  <TableCell className="tableHeadCell nodeActionsCell">&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testnetValidators.map((v: OwnNode) => (
                  <TestnetValidatorRow
                    key={v.address}
                    validator={v}
                    onEdit={setCurrentEditedNode}
                    onDelete={deleteTestnetNode}
                  />
                ))}
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
