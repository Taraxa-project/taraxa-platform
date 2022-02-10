import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Notification,
  BaseCard,
  Modal,
  Switch,
  Text,
  Icons,
  Card,
} from '@taraxa_project/taraxa-ui';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';

import { useMetaMask } from 'metamask-react';
import { useAuth } from '../../services/useAuth';
import { useDelegationApi } from '../../services/useApi';
import PublicNode from '../../interfaces/PublicNode';
import CloseIcon from '../../assets/icons/close';
import Title from '../../components/Title/Title';
import NodeRow from './Table/NodeRow';
import Delegate from './Modal/Delegate';
import Undelegate from './Modal/Undelegate';

import './delegation.scss';

const Delegation = () => {
  const { status, account } = useMetaMask();
  const auth = useAuth();
  const delegationApi = useDelegationApi();
  const isLoggedIn = !!auth.user?.id;

  const [ownValidatorsHaveCommissionChange, setOwnValidatorsHaveCommissionChange] = useState(false);
  const [showUserOwnValidators, setShowUserOwnValidators] = useState(false);
  const [showFullyDelegatedNodes, setShowFullyDelegatedNodes] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [averageDelegation, setAverageDelegation] = useState(0);
  const [totalDelegation, setTotalDelegation] = useState(0);
  const [totalValidators, setTotalValidators] = useState(0);
  const [nodes, setNodes] = useState<PublicNode[]>([]);
  const [delegateToNode, setDelegateToNode] = useState<PublicNode | null>(null);
  const [undelegateFromNode, setUndelegateFromNode] = useState<PublicNode | null>(null);

  const canDelegate = isLoggedIn && status === 'connected' && !!account;

  const getStats = useCallback(async () => {
    const data = await delegationApi.get(
      '/validators?show_fully_delegated=true&show_my_validators=false',
    );
    if (data.success) {
      let ownValidatorHasCommissionChange = false;
      let totalDelegationAcc = 0;
      data.response.forEach((node: any) => {
        if (node.totalDelegation) {
          totalDelegationAcc += node.totalDelegation;
        }

        if (node.hasPendingCommissionChange && node.isOwnValidator) {
          ownValidatorHasCommissionChange = true;
        }
      });

      setOwnValidatorsHaveCommissionChange(ownValidatorHasCommissionChange);
      setTotalDelegation(totalDelegationAcc);
      if (data.response.length > 0) {
        setAverageDelegation(Math.round(totalDelegationAcc / data.response.length));
        setTotalValidators(data.response.length);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    getStats();
  }, []);

  const getBalances = useCallback(async () => {
    if (!canDelegate) {
      return;
    }
    const data = await delegationApi.get(`/delegations/${account}/balances`);
    if (data.success) {
      setAvailableBalance(data.response.remaining);
    }
  }, [canDelegate, account]);

  useEffect(() => {
    getBalances();
  }, [getBalances]);

  const getValidators = useCallback(async () => {
    const data = await delegationApi.get(
      `/validators?show_fully_delegated=${showFullyDelegatedNodes}&show_my_validators=${showUserOwnValidators}`,
      isLoggedIn,
    );

    if (!data.success) {
      return;
    }

    setNodes(data.response);
  }, [isLoggedIn, showUserOwnValidators, showFullyDelegatedNodes]);

  useEffect(() => {
    getValidators();
  }, [getValidators]);

  const delegatableNodes = nodes.filter(({ remainingDelegation }) => remainingDelegation > 0);
  const fullyDelegatedNodes = nodes.filter(({ remainingDelegation }) => remainingDelegation === 0);

  return (
    <div className="runnode">
      {delegateToNode && (
        <Modal
          id="delegateModal"
          title="Delegate to..."
          show={!!delegateToNode}
          children={
            <Delegate
              validatorId={delegateToNode.id}
              validatorName={delegateToNode.name}
              validatorAddress={delegateToNode.address}
              delegatorAddress={account}
              remainingDelegation={delegateToNode.remainingDelegation}
              availableStakingBalance={availableBalance}
              onSuccess={() => {
                getBalances();
                getValidators();
                getStats();
              }}
              onFinish={() => {
                setDelegateToNode(null);
              }}
            />
          }
          parentElementID="root"
          onRequestClose={() => {
            setDelegateToNode(null);
          }}
          closeIcon={CloseIcon}
        />
      )}
      {undelegateFromNode && (
        <Modal
          id="delegateModal"
          title="Undelegate from..."
          show={!!undelegateFromNode}
          children={
            <Undelegate
              validatorId={undelegateFromNode.id}
              validatorName={undelegateFromNode.name}
              validatorAddress={undelegateFromNode.address}
              onSuccess={() => {
                getBalances();
                getValidators();
                getStats();
              }}
              onFinish={() => {
                setUndelegateFromNode(null);
              }}
            />
          }
          parentElementID="root"
          onRequestClose={() => {
            setUndelegateFromNode(null);
          }}
          closeIcon={CloseIcon}
        />
      )}
      <div className="runnode-content">
        <Title title="Delegation" />
        {isLoggedIn && ownValidatorsHaveCommissionChange && (
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
        )}
        {!isLoggedIn && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to sign in or sign up for a new account in order to participate in delegation."
              variant="danger"
            />
          </div>
        )}
        {isLoggedIn && status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You meed to connect to your Metamask wallet in order to participate in delegation."
              variant="danger"
            />
          </div>
        )}
        {totalValidators > 0 && (
          <div className="cardContainer">
            <BaseCard
              title={ethers.utils.commify(totalValidators)}
              description="Number of network validators"
            />
            <BaseCard
              title={ethers.utils.commify(averageDelegation)}
              description="Average TARA delegatated to validators"
            />
            <BaseCard
              title={ethers.utils.commify(totalDelegation)}
              description="Total TARA delegated to validators"
            />
          </div>
        )}
        <div className="flexDiv">
          <div>
            {isLoggedIn && (
              <Switch
                className="switch"
                name="Only show my validators"
                checked={showUserOwnValidators}
                label="Only show my validators"
                labelPlacement="end"
                onChange={() => {
                  setShowUserOwnValidators((v) => !v);
                }}
              />
            )}
            <Switch
              className="switch"
              name="Show fully delegated nodes"
              checked={showFullyDelegatedNodes}
              label="Show fully delegated nodes"
              labelPlacement="end"
              onChange={() => {
                setShowFullyDelegatedNodes((v) => !v);
              }}
            />
          </div>
          <div>
            <Card className="trophyLegend">
              <Icons.Trophy /> Multiple weeks winner of the testnet block producer challenge
            </Card>
          </div>
        </div>
        {nodes.length > 0 ? (
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
                {delegatableNodes.length > 0 &&
                  delegatableNodes.map((node) => (
                    <NodeRow
                      key={node.address}
                      node={node}
                      isLoggedIn={isLoggedIn}
                      status={status}
                      account={account}
                      setDelegateToNode={setDelegateToNode}
                      setUndelegateFromNode={setUndelegateFromNode}
                    />
                  ))}
                {fullyDelegatedNodes.length > 0 && (
                  <>
                    <TableRow className="tableRow">
                      <TableCell className="tableCell tableSection" colSpan={6}>
                        <div className="fullyDelegatedSeparator">fully delegated</div>
                      </TableCell>
                    </TableRow>
                    {fullyDelegatedNodes.map((node) => (
                      <NodeRow
                        key={node.address}
                        node={node}
                        isLoggedIn={isLoggedIn}
                        status={status}
                        account={account}
                        setDelegateToNode={setDelegateToNode}
                        setUndelegateFromNode={setUndelegateFromNode}
                      />
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Text
            label="No nodes found matching the selected filters"
            variant="h6"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '20px' }}
          />
        )}
      </div>
    </div>
  );
};

export default Delegation;
