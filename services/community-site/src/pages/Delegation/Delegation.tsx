import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Notification, BaseCard, Button, Modal, Switch, Text } from '@taraxa_project/taraxa-ui';

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
import NodeCommissionChangeIcon from '../../assets/icons/nodeCommissionChange';
import CloseIcon from '../../assets/icons/close';
import Title from '../../components/Title/Title';
import Delegate from './Modal/Delegate';

import './delegation.scss';

interface Node {
  id: number;
  user: number;
  name: string;
  address: string;
  active: boolean;
  currentCommission: number | null;
  pendingCommission: number | null;
  hasPendingCommissionChange: boolean;
  weeklyRank: string | null;
  remainingDelegation: number;
  totalDelegation: number;
  totalProduced: number;
  yield: number;
  blocksProduced: number | null;
  weeklyBlocksProduced: string | null;
  lastBlockCreatedAt: number | null;
}

const Delegation = () => {
  const { status, account } = useMetaMask();
  const auth = useAuth();
  const delegationApi = useDelegationApi();
  const isLoggedIn = !!auth.user?.id;

  const [ownValidatorsHaveCommissionChange, setOwnValidatorsHaveCommissionChange] = useState(false);
  const [showOnlyMyValidators, setShowOnlyMyValidators] = useState(false);
  const [showFullyDelegatedNodes, setShowFullyDelegatedNodes] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [averageDelegation, setAverageDelegation] = useState(0);
  const [totalDelegation, setTotalDelegation] = useState(0);
  const [totalValidators, setTotalValidators] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [delegateToNode, setDelegateToNode] = useState<Node | null>(null);

  const canDelegate = isLoggedIn && status === 'connected' && !!account;

  const checkOwnValidatorsCommissionChanges = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    const data = await delegationApi.get(
      '/validators?show_fully_delegated=true&show_my_validators=true',
      true,
    );
    if (data.success) {
      setOwnValidatorsHaveCommissionChange(
        data.response.filter((node: any) => node.hasPendingCommissionChange).length > 0,
      );
    }
  }, [isLoggedIn]);

  useEffect(() => {
    checkOwnValidatorsCommissionChanges();
  }, [checkOwnValidatorsCommissionChanges]);

  const getStats = useCallback(async () => {
    const data = await delegationApi.get(
      '/validators?show_fully_delegated=true&show_my_validators=false',
    );
    if (data.success) {
      let totalDelegationAcc = 0;
      data.response.forEach((node: any) => {
        if (node.totalDelegation) {
          totalDelegationAcc += node.totalDelegation;
        }
      });

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
      `/validators?show_fully_delegated=${showFullyDelegatedNodes}&show_my_validators=${showOnlyMyValidators}`,
      isLoggedIn,
    );
    if (!data.success) {
      return;
    }

    const now = new Date();
    const nodes = data.response.map((node: Node) => {
      if (node.lastBlockCreatedAt) {
        const lastMinedBlockDate = new Date(node.lastBlockCreatedAt);

        node.active = false;
        const minsDiff = Math.ceil((now.getTime() - lastMinedBlockDate.getTime()) / 1000 / 60);
        if (minsDiff < 24 * 60) {
          node.active = true;
        }
      }
      return node;
    });

    setNodes(nodes);
  }, [isLoggedIn, showOnlyMyValidators, showFullyDelegatedNodes]);

  useEffect(() => {
    getValidators();
  }, [getValidators]);

  const formatNodeName = (name: string) => {
    if (name.length <= 17) {
      return name;
    }
    return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
  };

  const rows = nodes.map((node) => {
    let className = 'dot';
    if (node.active) {
      className += ' active';
    }
    const status = (
      <div className="status">
        <div className={className} />
      </div>
    );

    const name = formatNodeName(!node.name ? node.address : node.name);
    const expectedYield = `${node.yield}%`;
    const currentCommission = `${node.currentCommission}%`;
    const pendingCommission = node.hasPendingCommissionChange ? `${node.pendingCommission}%` : null;
    const hasPendingCommissionChange = node.hasPendingCommissionChange;
    const totalDelegation = ethers.utils.commify(node.totalDelegation);
    const remainingDelegation =
      node.remainingDelegation > 0
        ? ethers.utils.commify(node.remainingDelegation)
        : '0 (Fully delegated)';

    const actions = (
      <>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          label="Delegate"
          disabled={!canDelegate}
          onClick={() => {
            setDelegateToNode(node);
          }}
        />
        <Button size="small" label="Un-delegate" className="delete" disabled />
      </>
    );

    return {
      status,
      name,
      expectedYield,
      currentCommission,
      pendingCommission,
      hasPendingCommissionChange,
      totalDelegation,
      remainingDelegation,
      actions,
      node,
    };
  });

  const delegatableNodes = rows.filter(({ node }) => node.remainingDelegation > 0);
  const fullyDelegatedNodes = rows.filter(({ node }) => node.remainingDelegation === 0);

  return (
    <div className="runnode">
      {delegateToNode && (
        <Modal
          id="signinModal"
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
                  setShowOnlyMyValidators(true);
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
        {isLoggedIn && (
          <Switch
            name="Show only my validators"
            checked={showOnlyMyValidators}
            label="Show only my validators"
            onChange={() => {
              setShowOnlyMyValidators((v) => !v);
            }}
          />
        )}
        <Switch
          name="Show fully delegated nodes"
          checked={showFullyDelegatedNodes}
          label="Show fully delegated nodes"
          onChange={() => {
            setShowFullyDelegatedNodes((v) => !v);
          }}
        />
        {rows.length > 0 ? (
          <TableContainer>
            <Table className="table">
              <TableHead>
                <TableRow className="tableHeadRow">
                  <TableCell className="tableHeadCell">Status</TableCell>
                  <TableCell className="tableHeadCell">Name</TableCell>
                  <TableCell className="tableHeadCell">Yield</TableCell>
                  <TableCell className="tableHeadCell">Commission</TableCell>
                  <TableCell className="tableHeadCell">Delegation</TableCell>
                  <TableCell className="tableHeadCell" colSpan={2}>
                    Available for Delegation
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {delegatableNodes.length > 0 &&
                  delegatableNodes.map((row) => (
                    <TableRow className="tableRow">
                      <TableCell className="tableCell">{row.status}</TableCell>
                      <TableCell className="tableCell">{row.name}</TableCell>
                      <TableCell className="tableCell">{row.expectedYield}</TableCell>
                      <TableCell className="tableCell">
                        {row.hasPendingCommissionChange ? (
                          <>
                            <NodeCommissionChangeIcon />{' '}
                            <span className="commissionDisplayPendingChange">
                              {row.currentCommission} ➞ {row.pendingCommission}
                            </span>
                          </>
                        ) : (
                          row.currentCommission
                        )}
                      </TableCell>
                      <TableCell className="tableCell">{row.totalDelegation}</TableCell>
                      <TableCell className="tableCell">{row.remainingDelegation}</TableCell>
                      <TableCell className="tableCell" align="right">
                        {row.actions}
                      </TableCell>
                    </TableRow>
                  ))}
                {fullyDelegatedNodes.length > 0 && (
                  <>
                    <TableRow className="tableRow">
                      <TableCell className="tableCell tableSection" colSpan={7}>
                        fully delegated nodes
                      </TableCell>
                    </TableRow>
                    {fullyDelegatedNodes.map((row) => (
                      <TableRow className="tableRow">
                        <TableCell className="tableCell">{row.status}</TableCell>
                        <TableCell className="tableCell">{row.name}</TableCell>
                        <TableCell className="tableCell">{row.expectedYield}</TableCell>
                        <TableCell className="tableCell">
                          {row.hasPendingCommissionChange ? (
                            <>
                              <NodeCommissionChangeIcon />{' '}
                              <span className="commissionDisplayPendingChange">
                                {row.currentCommission} ➞ {row.pendingCommission}
                              </span>
                            </>
                          ) : (
                            row.currentCommission
                          )}
                        </TableCell>
                        <TableCell className="tableCell">{row.totalDelegation}</TableCell>
                        <TableCell className="tableCell">{row.remainingDelegation}</TableCell>
                        <TableCell className="tableCell" align="right">
                          {row.actions}
                        </TableCell>
                      </TableRow>
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
