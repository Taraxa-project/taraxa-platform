/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
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
import useApi, { useDelegationApi } from '../../services/useApi';

import Title from '../../components/Title/Title';

import useStyles from './table-styles';
import './delegation.scss';

interface Node {
  id: number;
  user: number;
  address: string;
  active: boolean;
  commission?: number;
  delegation: string;
  ownDelegation: string;
}

type NodeStats = {
  totalProduced: number;
  lastBlockTimestamp: Date;
  rank: number;
  produced: number;
};

const Delegation = () => {
  const { status, account } = useMetaMask();
  const auth = useAuth();
  const api = useApi();
  const delegationApi = useDelegationApi();
  const classes = useStyles();
  const isLoggedIn = !!auth.user?.id;
  const canDelegate = isLoggedIn && auth.user!.kyc === 'APPROVED' && status === 'connected';

  const [nodes, setNodes] = useState<Node[]>([]);

  const getNodeStats = async (fetchedNodes: Node[]) => {
    const now = new Date();
    const nodesWithStats = fetchedNodes.map(async (node: any) => {
      const data = await api.get(
        `${process.env.REACT_APP_API_EXPLORER_HOST}/address/${node.address}/stats`,
        true,
      );
      if (!data.success) {
        return node;
      }

      const stats: Partial<NodeStats> = data.response;

      if (stats.lastBlockTimestamp && stats.lastBlockTimestamp !== null) {
        const lastMinedBlockDate = new Date(stats.lastBlockTimestamp);

        node.active = false;
        const minsDiff = Math.ceil((now.getTime() - lastMinedBlockDate.getTime()) / 1000 / 60);
        if (minsDiff < 24 * 60) {
          node.active = true;
        }
      }

      return node;
    });
    setNodes(await Promise.all(nodesWithStats));
  };

  const getNodes = useCallback(async () => {
    const data = await delegationApi.get('/validators');
    if (!data.success) {
      return;
    }
    const fetchedNodes = data.response.filter((node: any) => {
      if (isLoggedIn) {
        return node.user !== auth.user!.id;
      }
      return true;
    });
    setNodes(fetchedNodes);

    await getNodeStats(fetchedNodes);
  }, [isLoggedIn]);

  useEffect(() => {
    getNodes();
  }, [getNodes]);

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

    const name = formatNodeName(node.address);
    const expectedYield = '20%';
    const commission = node.commission;
    const totalDelegation = ethers.utils.commify(1000);
    const availableDelegation = ethers.utils.commify(500);

    const actions = (
      <>
        <Button
          size="small"
          color="secondary"
          variant="outlined"
          label="Delegate"
          className="edit"
          disabled={!canDelegate}
        />
        <Button size="small" label="Undelegate" className="delete" />
      </>
    );

    return {
      status,
      name,
      expectedYield,
      commission,
      totalDelegation,
      availableDelegation,
      actions,
    };
  });

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
        {isLoggedIn && auth.user!.kyc !== 'APPROVED' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You must first pass KYC in order to participate in delegation."
              variant="danger"
            />
          </div>
        )}
        <div className="cardContainer">
          {nodes.length > 0 && (
            <>
              <BaseCard title={`${nodes.length}`} description="Number of network validators" />
              <BaseCard title={ethers.utils.commify(2000)} description="Median delegation" />
              <BaseCard
                title={ethers.utils.commify(500000)}
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
                {rows.map((row) => (
                  <TableRow className={classes.tableRow}>
                    <TableCell className={classes.tableCell}>{row.status}</TableCell>
                    <TableCell className={classes.tableCell}>{row.name}</TableCell>
                    <TableCell className={classes.tableCell}>{row.expectedYield}</TableCell>
                    <TableCell className={classes.tableCell}>{row.commission}%</TableCell>
                    <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                    <TableCell className={classes.tableCell}>{row.availableDelegation}</TableCell>
                    <TableCell className={classes.tableCell} align="right">
                      {row.actions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default Delegation;
