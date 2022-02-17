import React from 'react';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { Button, Icons } from '@taraxa_project/taraxa-ui';
import { TableCell, TableRow } from '@material-ui/core';
import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import PublicNode from '../../../interfaces/PublicNode';

type NodeRowProps = {
  node: PublicNode;
  isLoggedIn: boolean;
  status: string;
  account: string | null;
  setDelegateToNode: (node: PublicNode) => void;
  setUndelegateFromNode: (node: PublicNode) => void;
};

const formatNodeName = (name: string) => {
  if (name.length <= 17) {
    return name;
  }
  return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
};

const NodeRow = ({
  node,
  isLoggedIn,
  status,
  account,
  setDelegateToNode,
  setUndelegateFromNode,
}: NodeRowProps) => {
  const history = useHistory();
  const canDelegate = isLoggedIn && status === 'connected' && !!account;
  const canUndelegate = isLoggedIn && status === 'connected' && !!account && node.canUndelegate;

  return (
    <TableRow className={clsx('tableRow', node.isOwnValidator && 'userValidator')}>
      <TableCell className="tableCell statusCell">
        <div className="status">
          <div className={clsx('dot', node.isActive && 'active')} />
        </div>
      </TableCell>
      <TableCell className="tableCell nameCell">
        <div className="flexCell" onClick={() => history.push(`/delegation/${node.id}`)}>
          <div>{formatNodeName(!node.name ? node.address : node.name)}</div>
          {node.isTopNode && (
            <div>
              <Icons.Trophy />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">{`${node.yield}%`}</TableCell>
      <TableCell className="tableCell commissionCell">
        {node.hasPendingCommissionChange ? (
          <div className="commissionDisplayPendingChangeWrapper">
            <NodeCommissionChangeIcon />{' '}
            <span className="commissionDisplayPendingChange">
              {`${node.currentCommission}%`} ➞ {`${node.pendingCommission}%`}
            </span>
          </div>
        ) : (
          `${node.currentCommission}%`
        )}
      </TableCell>
      <TableCell className="tableCell delegationCell">
        <strong>{ethers.utils.commify(node.totalDelegation)}</strong>
      </TableCell>
      <TableCell className="tableCell availableDelegationActionsCell">
        <div className="availableDelegation">
          {node.remainingDelegation > 0
            ? ethers.utils.commify(node.remainingDelegation)
            : '0 (Fully delegated)'}
        </div>
        <div className="validatorActions">
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
          <Button
            size="small"
            label="Un-delegate"
            disabled={!canUndelegate}
            className="delete"
            onClick={() => setUndelegateFromNode(node)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default NodeRow;
