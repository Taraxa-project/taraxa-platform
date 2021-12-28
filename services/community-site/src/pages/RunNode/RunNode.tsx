import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useMediaQuery } from 'react-responsive';
import {
  Modal,
  Notification,
  BaseCard,
  IconCard,
  Tooltip,
  Text,
  Button,
} from '@taraxa_project/taraxa-ui';

import CloseIcon from '../../assets/icons/close';
import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';
import EditIcon from '../../assets/icons/edit';
import DeleteIcon from '../../assets/icons/delete';

import { useAuth } from '../../services/useAuth';
import useApi, { useDelegationApi } from '../../services/useApi';

import Title from '../../components/Title/Title';

import RegisterNode from './Modal/RegisterNode';
import UpdateNode from './Modal/UpdateNode';

import './runnode.scss';

interface Node {
  id: number;
  name: string;
  address: string;
  ip: string;
  active: boolean;
  type: 'mainnet' | 'testnet';
}

type NodeStats = {
  totalProduced: number;
  lastBlockTimestamp: Date;
  rank: number;
  produced: number;
};

interface RunNodeModalProps {
  hasRegisterNodeModal: boolean;
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void;
  hasUpdateNodeModal: boolean;
  setHasUpdateNodeModal: (hasUpdateNodeModal: boolean) => void;
  getNodes: () => void;
  currentEditedNode: null | Node;
  nodeType: 'mainnet' | 'testnet';
}

const RunNodeModal = ({
  hasRegisterNodeModal,
  hasUpdateNodeModal,
  setHasRegisterNodeModal,
  setHasUpdateNodeModal,
  getNodes,
  currentEditedNode,
  nodeType,
}: RunNodeModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  let modal;

  if (hasRegisterNodeModal) {
    modal = (
      <RegisterNode
        type={nodeType}
        onSuccess={() => {
          getNodes();
          setHasRegisterNodeModal(false);
        }}
      />
    );
  }

  if (hasUpdateNodeModal && currentEditedNode !== null) {
    modal = (
      <UpdateNode
        id={currentEditedNode.id}
        name={currentEditedNode.name}
        ip={currentEditedNode.ip}
      />
    );
  }

  if (!modal) {
    return null;
  }

  return (
    <Modal
      id={isMobile ? 'mobile-signinModal' : 'signinModal'}
      title="Register Node"
      show={hasRegisterNodeModal || hasUpdateNodeModal}
      children={modal}
      parentElementID="root"
      onRequestClose={() => {
        setHasRegisterNodeModal(false);
        setHasUpdateNodeModal(false);
      }}
      closeIcon={CloseIcon}
    />
  );
};

interface ReferencesProps {
  isLoggedIn: boolean;
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void;
}

const References = ({ isLoggedIn, setHasRegisterNodeModal }: ReferencesProps) => {
  return (
    <div className="box">
      <Text label="References" variant="h6" color="primary" className="box-title" />
      <Button
        label="How do I install a node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/testnet_node_setup',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="Where do I find my address?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/node_address',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="How do I register my node?"
        className="referenceButton"
        variant="contained"
        onClick={() => setHasRegisterNodeModal(true)}
        disabled={!isLoggedIn}
      />
      <Button
        label="How do I upgrade my node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/upgrade-a-node/software-upgrade',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="How do I reset my node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/upgrade-a-node/data-reset',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="I need help!"
        className="referenceButton"
        variant="contained"
        onClick={() => window.open('https://taraxa.io/discord', '_blank', 'noreferrer noopener')}
      />
    </div>
  );
};

const RunNode = () => {
  const auth = useAuth();
  const api = useApi();
  const delegationApi = useDelegationApi();

  const isLoggedIn = !!auth.user?.id;

  const [nodeType, setNodeType] = useState<'mainnet' | 'testnet'>('testnet');
  const [hasRegisterNodeModal, setHasRegisterNodeModal] = useState(false);
  const [hasUpdateNodeModal, setHasUpdateNodeModal] = useState(false);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | Node>(null);

  const [typeNodes, setTypeNodes] = useState<Node[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [blocksProduced, setBlocksProduced] = useState('0');
  const [weeklyRating, setWeeklyRating] = useState('N/A');

  const getNodes = useCallback(async () => {
    const data = await delegationApi.get('/nodes', true);
    if (!data.success) {
      return;
    }
    setNodes(data.response);
    setTypeNodes(data.response.filter((node: any) => node.type === nodeType));
  }, [nodeType]);

  useEffect(() => {
    getNodes();
  }, [getNodes]);

  useEffect(() => {
    const getNodeStats = async () => {
      const now = new Date();
      let totalProduced = 0;
      let rank: number;
      const newTypeNodes = typeNodes.map(async (node) => {
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

        if (stats.totalProduced) {
          totalProduced += stats.totalProduced;
        }

        if (stats.rank) {
          if (rank) {
            rank = Math.min(rank, stats.rank);
          } else {
            rank = stats.rank;
          }
        }
        return node;
      });
      setTypeNodes(await Promise.all(newTypeNodes));
      if (rank!) {
        setWeeklyRating(`#${rank}`);
      }
      setBlocksProduced(ethers.utils.commify(totalProduced.toString()));
    };

    if (typeNodes.length > 0) {
      getNodeStats();
    }
  }, [nodeType]);

  const deleteNode = async (node: Node) => {
    await delegationApi.del(`/nodes/${node.id}`, true);
    getNodes();
  };

  const formatNodeName = (name: string) => {
    if (name.length <= 17) {
      return name;
    }
    return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
  };

  const rows = typeNodes.map((node) => {
    let className = 'dot';
    if (node.active) {
      className += ' active';
    }
    return (
      <div key={node.id}>
        <div className="status">
          <div className={className} />
        </div>
        <div className="address">
          {formatNodeName(!node.name || node.name === '' ? node.address : node.name)}
        </div>
        <Button
          size="small"
          Icon={EditIcon}
          className="edit"
          onClick={() => {
            setCurrentEditedNode(node);
            setHasUpdateNodeModal(true);
          }}
        />
        <Button
          size="small"
          Icon={DeleteIcon}
          className="delete"
          onClick={() => {
            const confirmation = window.confirm('Are you sure you want to delete this node?');

            if (confirmation) {
              deleteNode(node);
            }
          }}
        />
      </div>
    );
  });

  const nodeTypeLabel = nodeType === 'mainnet' ? 'Mainnet Candidate' : 'Testnet';

  return (
    <div className="runnode">
      <RunNodeModal
        hasUpdateNodeModal={hasUpdateNodeModal}
        hasRegisterNodeModal={hasRegisterNodeModal}
        setHasRegisterNodeModal={setHasRegisterNodeModal}
        setHasUpdateNodeModal={setHasUpdateNodeModal}
        currentEditedNode={currentEditedNode}
        getNodes={getNodes}
        nodeType={nodeType}
      />
      <div className="runnode-content">
        <Title title="Running a Node" />
        {!isLoggedIn && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to sign in or sign up for a new account in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {isLoggedIn && typeNodes.length === 0 && (
          <div className="notification">
            <Notification
              title="Notice:"
              text={`You aren’t running any block-producing nodes on the ${nodeTypeLabel}`}
              variant="danger"
            />
          </div>
        )}
        {isLoggedIn && (
          <div className="nodeTypes">
            <Text label="My Nodes" variant="h6" color="primary" className="box-title" />
            <Button
              label="Mainnet Candidate"
              variant="contained"
              onClick={() => {
                setNodeType('mainnet');
                setTypeNodes(nodes.filter((node: any) => node.type === 'mainnet'));
              }}
            />
            <Button
              label="Testnet"
              variant="contained"
              onClick={() => {
                setNodeType('testnet');
                setTypeNodes(nodes.filter((node: any) => node.type === 'testnet'));
              }}
            />
            <Button
              label={`Register a node (on the ${nodeTypeLabel})`}
              className="referenceButton"
              variant="contained"
              onClick={() => setHasRegisterNodeModal(true)}
            />
          </div>
        )}

        <div className="cardContainer">
          {typeNodes.length > 0 && (
            <>
              <BaseCard
                title={`${typeNodes.filter((node) => node.active).length}`}
                description="Active nodes"
                tooltip={
                  <Tooltip
                    title="A node is considered active if it produced at least one block in the last 24 hours."
                    Icon={InfoIcon}
                  />
                }
              />
              <BaseCard title={blocksProduced} description="Blocks produced" />
              <BaseCard
                title={weeklyRating}
                description="Weekly block production ranking of your top node"
              />
            </>
          )}
          {typeNodes.length === 0 && (
            <>
              <IconCard
                title="Register a node"
                description="Register a node you’ve aleady set up."
                onClickText={`Register a node (on the ${nodeTypeLabel})`}
                onClickButton={() => setHasRegisterNodeModal(true)}
                Icon={NodeIcon}
                disabled={!isLoggedIn}
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
        {typeNodes.length > 0 && (
          <div className="box">
            <Text label="Nodes" variant="h6" color="primary" className="box-title" />
            <div className="box-list">
              {[0, 1, 2].map((col) => {
                const l = col * 4;
                const r = rows.slice(l, l + 4);
                return (
                  <div key={col} className="box-list-col">
                    {r}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <References isLoggedIn={isLoggedIn} setHasRegisterNodeModal={setHasRegisterNodeModal} />
      </div>
    </div>
  );
};

export default RunNode;
