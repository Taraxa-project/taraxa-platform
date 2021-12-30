import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { Notification, BaseCard, Button, Modal } from '@taraxa_project/taraxa-ui';

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

import useStyles from './table-styles';
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
  const classes = useStyles();
  const isLoggedIn = !!auth.user?.id;

  const [availableBalance, setAvailableBalance] = useState(0);
  const [averageDelegation, setAverageDelegation] = useState(0);
  const [totalDelegation, setTotalDelegation] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [delegateToNode, setDelegateToNode] = useState<Node | null>(null);

  const canDelegate = isLoggedIn && status === 'connected';

  const getBalances = useCallback(async () => {
    if (!isLoggedIn || !account) {
      return;
    }
    const data = await delegationApi.get(`/delegations/${account}/balances`);
    if (data.success) {
      setAvailableBalance(data.response.remaining);
    }
  }, [isLoggedIn, account]);

  useEffect(() => {
    getBalances();
  }, [getBalances]);

  const getValidators = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    const data = await delegationApi.get(
      '/validators?show_fully_delegated=true&show_my_validators=false',
      true,
    );
    if (!data.success) {
      return;
    }

    let totalDelegationAcc = 0;
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

      if (node.totalDelegation) {
        totalDelegationAcc += node.totalDelegation;
      }

      return node;
    });

    setNodes(nodes);
    setTotalDelegation(totalDelegationAcc);
    if (nodes.length > 0) {
      setAverageDelegation(totalDelegationAcc / nodes.length);
    }
  }, [isLoggedIn]);

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

  const myNodes = isLoggedIn ? rows.filter(({ node }) => node.user === auth.user!.id) : [];
  const delegatableNodes = isLoggedIn
    ? rows.filter(({ node }) => node.user !== auth.user!.id && node.remainingDelegation > 0)
    : rows.filter(({ node }) => node.remainingDelegation > 0);
  const fullyDelegatedNodes = isLoggedIn
    ? rows.filter(({ node }) => node.user !== auth.user!.id && node.remainingDelegation === 0)
    : rows.filter(({ node }) => node.remainingDelegation === 0);

  return (
    <div className="runnode">
      {delegateToNode && account && (
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
        <div className="cardContainer">
          {nodes.length > 0 && (
            <>
              <BaseCard
                title={ethers.utils.commify(nodes.length)}
                description="Number of network validators"
              />
              <BaseCard
                title={ethers.utils.commify(Math.round(averageDelegation))}
                description="Average TARA delegatated to validators"
              />
              <BaseCard
                title={ethers.utils.commify(totalDelegation)}
                description="Total TARA delegated to validators"
              />
            </>
          )}
        </div>
        {rows.length > 0 && (
          <TableContainer>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.tableHeadRow}>
                  <TableCell className={classes.tableHeadCell}>Status</TableCell>
                  <TableCell className={classes.tableHeadCell}>Name</TableCell>
                  <TableCell className={classes.tableHeadCell}>Yield</TableCell>
                  <TableCell className={classes.tableHeadCell}>Commission</TableCell>
                  <TableCell className={classes.tableHeadCell}>Delegation</TableCell>
                  <TableCell className={classes.tableHeadCell} colSpan={2}>
                    Available for Delegation
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {delegatableNodes.length > 0 &&
                  delegatableNodes.map((row) => (
                    <TableRow className={classes.tableRow}>
                      <TableCell className={classes.tableCell}>{row.status}</TableCell>
                      <TableCell className={classes.tableCell}>{row.name}</TableCell>
                      <TableCell className={classes.tableCell}>{row.expectedYield}</TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.hasPendingCommissionChange ? (
                          <>
                            <NodeCommissionChangeIcon />{' '}
                            <span className={classes.commissionDisplayPendingChange}>
                              {row.currentCommission} ➞ {row.pendingCommission}
                            </span>
                          </>
                        ) : (
                          row.currentCommission
                        )}
                      </TableCell>
                      <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                      <TableCell className={classes.tableCell}>{row.remainingDelegation}</TableCell>
                      <TableCell className={classes.tableCell} align="right">
                        {row.actions}
                      </TableCell>
                    </TableRow>
                  ))}
                {myNodes.length > 0 && (
                  <>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={clsx(classes.tableCell, classes.tableSection)}
                        colSpan={7}
                      >
                        my nodes
                      </TableCell>
                    </TableRow>
                    {myNodes.map((row) => (
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell}>{row.status}</TableCell>
                        <TableCell className={classes.tableCell}>{row.name}</TableCell>
                        <TableCell className={classes.tableCell}>{row.expectedYield}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {row.hasPendingCommissionChange ? (
                            <>
                              <NodeCommissionChangeIcon />{' '}
                              <span className={classes.commissionDisplayPendingChange}>
                                {row.currentCommission} ➞ {row.pendingCommission}
                              </span>
                            </>
                          ) : (
                            row.currentCommission
                          )}
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {row.remainingDelegation}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="right">
                          {row.actions}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                {fullyDelegatedNodes.length > 0 && (
                  <>
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        className={clsx(classes.tableCell, classes.tableSection)}
                        colSpan={7}
                      >
                        fully delegated nodes
                      </TableCell>
                    </TableRow>
                    {fullyDelegatedNodes.map((row) => (
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell}>{row.status}</TableCell>
                        <TableCell className={classes.tableCell}>{row.name}</TableCell>
                        <TableCell className={classes.tableCell}>{row.expectedYield}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {row.hasPendingCommissionChange ? (
                            <>
                              <NodeCommissionChangeIcon />{' '}
                              <span className={classes.commissionDisplayPendingChange}>
                                {row.currentCommission} ➞ {row.pendingCommission}
                              </span>
                            </>
                          ) : (
                            row.currentCommission
                          )}
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {row.remainingDelegation}
                        </TableCell>
                        <TableCell className={classes.tableCell} align="right">
                          {row.actions}
                        </TableCell>
                      </TableRow>
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
