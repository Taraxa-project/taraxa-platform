import { useState, useEffect, useCallback } from 'react';
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
  Pagination,
} from '@taraxa_project/taraxa-ui';

import CloseIcon from '../../assets/icons/close';
import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';
import EditIcon from '../../assets/icons/edit';
import DeleteIcon from '../../assets/icons/delete';

import { useAuth } from '../../services/useAuth';
import { useApi } from '../../services/useApi';

import Title from '../../components/Title/Title';

import RegisterNode from './Modal/RegisterNode';
import UpdateNode from './Modal/UpdateNode';

import './runnode.scss';

interface Node {
  id: number;
  name: string;
  ethWallet: string;
  active: boolean;
}

const RunNode = () => {
  const auth = useAuth();
  const api = useApi();

  const isLoggedIn = !!auth.user?.id;

  const [hasRegisterNodeModal, setHasRegisterNodeModal] = useState(false);
  const [hasUpdateNodeModal, setHasUpdateNodeModal] = useState(false);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | Node>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [blocksProduced, setBlocksProduced] = useState('0');
  const [weeklyRating, setWeeklyRating] = useState('N/A');
  const [page, setPage] = useState(1);

  const getNodes = useCallback(async () => {
    const data = await api.get(`/nodes?_limit=-1`, true);
    if (!data.success) {
      return;
    }
    setNodes(data.response);
  }, []);

  useEffect(() => {
    getNodes();
  }, [getNodes]);

  useEffect(() => {
    const getTopNodes = async () => {
      const limit = 100;
      type ExplorerNode = {
        _id?: string;
        address: string;
        count: number;
      };
      let explorerNodes: ExplorerNode[] = [];

      let lastResponse;
      let page = 1;
      do {
        const skip = (page - 1) * limit;
        const data = await api.get(
          `${process.env.REACT_APP_API_EXPLORER_HOST}/nodes?limit=${limit}&skip=${skip}`,
          true,
        );
        if (!data.success) {
          break;
        }
        lastResponse = data.response;
        explorerNodes = [
          ...explorerNodes,
          ...lastResponse.result.nodes.map((node: ExplorerNode) => ({
            address: node._id?.toLowerCase(),
            count: node.count,
          })),
        ];
        page++;
      } while (explorerNodes.length < lastResponse.total);
      const wr = nodes
        .map((node) => node.ethWallet)
        .reduce((acc, wallet) => {
          const nodePosition = explorerNodes.findIndex(
            (node) => node.address.toLowerCase() === wallet,
          );
          if (nodePosition !== -1) {
            acc = Math.min(acc, nodePosition + 1);
          }
          return acc;
        }, Infinity);
      if (wr !== Infinity) {
        setWeeklyRating(`#${wr}`);
      }
    };

    if (nodes.length > 0) {
      getTopNodes();
    }
  }, [nodes.length]);

  useEffect(() => {
    const getNodeStats = async () => {
      const now = new Date();
      let totalProduced = 0;
      setNodes(
        await Promise.all(
          nodes.map(async (node) => {
            const data = await api.get(
              `${process.env.REACT_APP_API_EXPLORER_HOST}/address/${node.ethWallet}`,
              true,
            );
            if (!data.success) {
              return node;
            }

            type NodeStats = {
              lastMinedBlockDate?: Date | null;
              produced?: number;
            };
            const stats: NodeStats = data.response;

            if (stats.lastMinedBlockDate && stats.lastMinedBlockDate !== null) {
              const lastMinedBlockDate = new Date(stats.lastMinedBlockDate);

              node.active = false;
              const diff = Math.ceil((now.getTime() - lastMinedBlockDate.getTime()) / 1000);
              if (diff / 60 < 120) {
                node.active = true;
              }
            }

            if (stats.produced) {
              totalProduced += stats.produced;
            }
            return node;
          }),
        ),
      );
      setBlocksProduced(ethers.utils.commify(totalProduced.toString()));
    };

    if (nodes.length > 0) {
      getNodeStats();
    }
  }, [nodes.length]);

  const deleteNode = async (node: Node) => {
    await api.del(`/nodes/${node.id}`, true);
    getNodes();
  };

  const formatNodeName = (name: string) => {
    if (name.length <= 17) {
      return name;
    }
    return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
  };

  const nodesPerPage = 12;
  const totalPages = Math.ceil(nodes.length / nodesPerPage);
  const start = (page - 1) * nodesPerPage;
  const end = start + nodesPerPage;
  const paginatedNodes = nodes.slice(start, end);

  const rows = paginatedNodes.map((node) => {
    let className = 'dot';
    if (node.active) {
      className += ' active';
    }
    return (
      <div key={node.id}>
        <div className="status">
          <div className={className}></div>
        </div>
        <div className="address">
          {formatNodeName(!node.name || node.name === '' ? node.ethWallet : node.name)}
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

  return (
    <div className="runnode">
      <RunNodeModal
        hasUpdateNodeModal={hasUpdateNodeModal}
        hasRegisterNodeModal={hasRegisterNodeModal}
        setHasRegisterNodeModal={setHasRegisterNodeModal}
        setHasUpdateNodeModal={setHasUpdateNodeModal}
        currentEditedNode={currentEditedNode}
        getNodes={getNodes}
      />
      <div className="runnode-content">
        <Title
          title="Running Testnet Nodes"
          subtitle="Help accelerate Taraxa’s path towards mainnet by running nodes on the testnet"
        />
        {!isLoggedIn && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to sign in or sign up for a new account in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {isLoggedIn && nodes.length === 0 && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You aren’t running any block-producing nodes"
              variant="danger"
            />
          </div>
        )}
        <div className="cardContainer">
          {nodes.length > 0 && (
            <>
              <BaseCard
                title={`${nodes.filter((node) => node.active).length}`}
                description="Active nodes"
                tooltip={
                  <Tooltip
                    title="A node is considered active if it produced at least one block in the last 2 hours."
                    Icon={InfoIcon}
                  />
                }
              />
              <BaseCard title={blocksProduced} description="Blocks produced" />
              <BaseCard title={weeklyRating} description="Weekly rating" />
            </>
          )}
          {nodes.length === 0 && (
            <>
              <IconCard
                title="Register a node"
                description="Register a node you’ve aleady set up."
                onClickText="Register a node"
                onClickButton={() => setHasRegisterNodeModal(true)}
                Icon={NodeIcon}
                tooltip={
                  <Tooltip
                    className="runnode-icon-tooltip"
                    title="A registered node (which has already been setup) will automatically be delegated enough testnet tokens to participate in consensus."
                    Icon={InfoIcon}
                  />
                }
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
        {nodes.length > 0 && (
          <div className="box">
            <Text label="Nodes" variant="h6" color="primary" className="box-title" />
            <div className="box-pagination">
              <Pagination
                page={page}
                totalPages={totalPages}
                prev={() => {
                  setPage(page - 1);
                }}
                next={() => {
                  setPage(page + 1);
                }}
              />
            </div>
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
            <Button
              label="Register a new node"
              color="secondary"
              variant="contained"
              onClick={() => setHasRegisterNodeModal(true)}
            />
          </div>
        )}
        <References isLoggedIn={isLoggedIn} setHasRegisterNodeModal={setHasRegisterNodeModal} />
      </div>
    </div>
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

interface RunNodeModalProps {
  hasRegisterNodeModal: boolean;
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void;
  hasUpdateNodeModal: boolean;
  setHasUpdateNodeModal: (hasUpdateNodeModal: boolean) => void;
  getNodes: () => void;
  currentEditedNode: null | Node;
}

const RunNodeModal = ({
  hasRegisterNodeModal,
  hasUpdateNodeModal,
  setHasRegisterNodeModal,
  setHasUpdateNodeModal,
  getNodes,
  currentEditedNode,
}: RunNodeModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  let modal;

  if (hasRegisterNodeModal) {
    modal = (
      <RegisterNode
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
        onSuccess={() => {
          getNodes();
          setHasUpdateNodeModal(false);
        }}
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

export default RunNode;
