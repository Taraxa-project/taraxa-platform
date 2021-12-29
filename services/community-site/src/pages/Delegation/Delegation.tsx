import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { Notification, BaseCard, Button } from '@taraxa_project/taraxa-ui';

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

import Title from '../../components/Title/Title';

import useStyles from './table-styles';
import './delegation.scss';

interface Delegation {
  node: number;
  from: string;
  value: number;
}
interface Validator {
  address: string;
  commission: number;
  delegation: null | number;
  id: number;
  ownDelegation: null | number;
  user: number;
}

interface Node {
  id: number;
  user: number;
  name: string;
  address: string;
  ip: string;
  active: boolean;
  type: 'mainnet' | 'testnet';
  commissions: any[];
  rank: string;
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
  const [delegations, setDelegations] = useState<Delegation[]>([]);

  const canDelegate = isLoggedIn && status === 'connected' && availableBalance > 0;

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

  const getDelegations = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    const data = await delegationApi.get('/delegations', true);
    if (data.success) {
      setDelegations(data.response);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    getDelegations();
  }, [getDelegations]);

  const getNodes = useCallback(
    async (validators: Validator[]) => {
      if (!isLoggedIn) {
        return;
      }
      let totalDelegationAcc = 0;
      const now = new Date();
      const nodePromises = validators.map(async (validator: Validator) => {
        const data = await delegationApi.get(`/nodes/${validator.id}`, true);
        if (!data.success || !data.response) {
          return [];
        }

        const node: Node = data.response;

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

        return [node];
      });

      const nodes = (await Promise.all(nodePromises)).flat();

      setNodes(nodes);
      setTotalDelegation(totalDelegationAcc);
      if (nodes.length > 0) {
        setAverageDelegation(totalDelegationAcc / nodes.length);
      }
    },
    [isLoggedIn],
  );

  const getValidators = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    const data = await delegationApi.get('/validators');
    if (!data.success) {
      return;
    }
    await getNodes(data.response);
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
    const currentCommission = `${node.currentCommission || 0}%`;
    const totalDelegation = ethers.utils.commify(node.totalDelegation);
    const remainingDelegation = ethers.utils.commify(node.remainingDelegation);

    const actions = (
      <>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          label="Delegate"
          disabled={!canDelegate}
        />
        <Button
          size="small"
          label="Un-delegate"
          className="delete"
          disabled={
            delegations.filter(
              (delegation) => delegation.from === account && delegation.node === node.id,
            ).length === 0
          }
        />
      </>
    );

    return {
      status,
      name,
      expectedYield,
      currentCommission,
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
                title={ethers.utils.commify(averageDelegation)}
                description="Average delegation"
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
                      <TableCell className={classes.tableCell}>{row.currentCommission}</TableCell>
                      <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                      <TableCell className={classes.tableCell}>{row.remainingDelegation}</TableCell>
                      <TableCell className={classes.tableCell} align="right">
                        {row.actions}
                      </TableCell>
                    </TableRow>
                  ))}
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
                        <TableCell className={classes.tableCell}>{row.currentCommission}</TableCell>
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
                        <TableCell className={classes.tableCell}>{row.currentCommission}</TableCell>
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
