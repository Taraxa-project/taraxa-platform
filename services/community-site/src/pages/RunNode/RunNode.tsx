/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
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
  Card,
  InputField,
} from '@taraxa_project/taraxa-ui';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';

import CloseIcon from '../../assets/icons/close';
import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';

import { useAuth } from '../../services/useAuth';
import useApi, { useDelegationApi } from '../../services/useApi';

import Title from '../../components/Title/Title';

import RegisterNode from './Modal/RegisterNode';
import UpdateNode from './Modal/UpdateNode';

import useStyles from './table-styles';
import './runnode.scss';

interface Node {
  id: number;
  name: string;
  address: string;
  ip: string;
  active: boolean;
  type: 'mainnet' | 'testnet';
  commission: number;
  rank: string;
}

type NodeStats = {
  totalProduced: number;
  lastBlockTimestamp: Date;
  rank: number;
  produced: number;
};

interface Profile {
  description: string;
  website: string;
  social: string;
}
interface EditProfileProps {
  closeCreateOrEditProfile: (refreshProfile: boolean) => void;
  action: 'create' | 'edit';
  profile?: Profile;
}

const CreateOrEditProfile = ({ closeCreateOrEditProfile, action, profile }: EditProfileProps) => {
  const [description, setDescription] = useState(profile ? profile.description : '');
  const [descriptionError, setDescriptionError] = useState('');
  const [website, setWebsite] = useState(profile ? profile.website : '');
  const [social, setSocial] = useState(profile ? profile.social : '');
  const delegationApi = useDelegationApi();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!description) {
      setDescriptionError("can't be empty");
      return;
    }
    setDescriptionError('');

    const payload = { description, social, website };
    let result;
    if (action === 'create') {
      result = await delegationApi.post('/profiles', payload, true);
    } else {
      result = await delegationApi.put('/profiles', payload, true);
    }

    if (result.success) {
      closeCreateOrEditProfile(true);
    }
  };

  return (
    <>
      <Text
        label={action === 'create' ? 'Create profile' : 'Update profile'}
        variant="h6"
        color="primary"
      />
      <form onSubmit={submit}>
        <div className="editProfileForm">
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Description"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!descriptionError}
                helperText={descriptionError}
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={description}
                variant="standard"
                onChange={(event: any) => {
                  setDescription(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Website (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={website}
                variant="standard"
                onChange={(event: any) => {
                  setWebsite(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Social (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={social}
                variant="standard"
                onChange={(event: any) => {
                  setSocial(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
        </div>
        <div id="buttonsContainer">
          <Button
            type="submit"
            label={action === 'create' ? 'Create profile' : 'Update profile'}
            variant="contained"
            color="secondary"
            onClick={submit}
          />
          <Button
            label="Cancel"
            variant="contained"
            id="grayButton"
            onClick={() => {
              closeCreateOrEditProfile(false);
            }}
          />
        </div>
      </form>
    </>
  );
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
  const classes = useStyles();

  const isLoggedIn = !!auth.user?.id;

  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nodeType, setNodeType] = useState<'mainnet' | 'testnet'>('testnet');
  const [hasRegisterNodeModal, setHasRegisterNodeModal] = useState(false);
  const [hasUpdateNodeModal, setHasUpdateNodeModal] = useState(false);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | Node>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [blocksProduced, setBlocksProduced] = useState('0');
  const [weeklyRating, setWeeklyRating] = useState('N/A');
  const [profile, setProfile] = useState<Profile | undefined>(undefined);

  const getProfile = useCallback(async () => {
    const data = await delegationApi.get('/profiles', true);
    console.dir(data);
    if (!data.success) {
      return;
    }

    setProfile(data.response);
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const getNodeStats = async (fetchedNodes: Node[]) => {
    const now = new Date();
    let totalProduced = 0;
    let rank: number;
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

      if (stats.totalProduced) {
        totalProduced += stats.totalProduced;
      }

      if (stats.rank) {
        if (rank) {
          rank = Math.min(rank, stats.rank);
        } else {
          rank = stats.rank;
        }

        node.rank = `#${stats.rank}`;
      } else {
        node.rank = 'N/A';
      }

      return node;
    });
    setNodes(await Promise.all(nodesWithStats));
    if (rank!) {
      setWeeklyRating(`#${rank}`);
    }
    setBlocksProduced(ethers.utils.commify(totalProduced));
  };

  const getNodes = useCallback(async () => {
    const data = await delegationApi.get(`/nodes?type=${nodeType}`, true);
    console.dir(data);
    if (!data.success) {
      return;
    }
    const fetchedNodes = data.response.map((node: any) => {
      node.rank = 'N/A';
      return node;
    });
    setNodes(fetchedNodes);

    await getNodeStats(fetchedNodes);
  }, [nodeType]);

  useEffect(() => {
    getNodes();
  }, [getNodes]);

  const deleteNode = async (node: Node) => {
    await delegationApi.del(`/nodes/${node.id}`, true);
    await getNodes();
  };

  const formatNodeName = (name: string) => {
    if (name.length <= 17) {
      return name;
    }
    return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
  };

  if (isCreatingProfile) {
    return (
      <CreateOrEditProfile
        action="create"
        closeCreateOrEditProfile={(refreshProfile) => {
          setIsCreatingProfile(false);
          if (refreshProfile) {
            getProfile();
          }
        }}
      />
    );
  }

  if (isEditingProfile) {
    return (
      <CreateOrEditProfile
        action="edit"
        profile={profile}
        closeCreateOrEditProfile={(refreshProfile) => {
          setIsEditingProfile(false);
          if (refreshProfile) {
            getProfile();
          }
        }}
      />
    );
  }

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

    const name = formatNodeName(!node.name || node.name === '' ? node.address : node.name);
    const expectedYield = '20%';
    const commission = `${node.commission}%`;
    const totalDelegation = ethers.utils.commify(1000);
    const availableDelegation = ethers.utils.commify(500);
    const rank = node.rank;

    const actions = (
      <>
        <Button
          size="small"
          label="Edit"
          className="edit"
          onClick={() => {
            setCurrentEditedNode(node);
            setHasUpdateNodeModal(true);
          }}
        />
        <Button
          size="small"
          label="Delete"
          className="delete"
          onClick={() => {
            const confirmation = window.confirm('Are you sure you want to delete this node?');
            if (confirmation) {
              deleteNode(node);
            }
          }}
        />
      </>
    );

    return {
      status,
      name,
      expectedYield,
      commission,
      totalDelegation,
      availableDelegation,
      rank,
      actions,
    };
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
        {isLoggedIn &&
          (profile ? (
            <Card className="nodeProfile">
              <Text label={auth.user!.username} variant="h4" color="primary" />
              <Text label="Description" variant="h6" color="primary" />
              <p>{profile.description}</p>
              {profile.website && (
                <>
                  <Text label="Website" variant="h6" color="primary" />
                  <p>
                    <a href={profile.website}>{profile.website}</a>
                  </p>
                </>
              )}
              {profile.social && (
                <>
                  <Text label="Social" variant="h6" color="primary" />
                  <p>
                    <a href={profile.social}>{profile.social}</a>
                  </p>
                </>
              )}
              <Button
                label="Update profile"
                className="referenceButton"
                variant="contained"
                onClick={() => setIsEditingProfile(true)}
              />
            </Card>
          ) : (
            <Card className="noProfile">
              <p>Setup your node runner profile to be able to register Mainnet nodes.</p>
              <Button
                type="submit"
                label="Create profile"
                color="secondary"
                variant="contained"
                className="marginButton"
                onClick={() => {
                  setIsCreatingProfile(true);
                }}
              />
            </Card>
          ))}
        {!isLoggedIn && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to sign in or sign up for a new account in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {isLoggedIn && (
          <div className="nodeTypes">
            <NodeIcon />
            <Text label="My nodes" variant="h6" color="primary" className="box-title" />
            <Button
              size="small"
              className={clsx('nodeTypeTab', nodeType === 'mainnet' && 'active')}
              label="Mainnet Candidate"
              variant="contained"
              onClick={() => {
                setNodeType('mainnet');
              }}
            />
            <Button
              size="small"
              className={clsx('nodeTypeTab', nodeType === 'testnet' && 'active')}
              label="Testnet"
              variant="contained"
              onClick={() => {
                setNodeType('testnet');
              }}
            />
            <Button
              size="small"
              className="registerNode"
              label={
                nodeType === 'mainnet' && !profile
                  ? `Please create your profile to register a node (on the ${nodeTypeLabel})`
                  : `Register a node (on the ${nodeTypeLabel})`
              }
              variant="contained"
              color="secondary"
              disabled={nodeType === 'mainnet' && !profile}
              onClick={() => setHasRegisterNodeModal(true)}
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
          {nodes.length === 0 && (
            <>
              <IconCard
                title="Register a node"
                description={
                  nodeType === 'mainnet' && !profile
                    ? 'Please create your profile to register a node.'
                    : 'Register a node you’ve aleady set up.'
                }
                onClickText={`Register a node (on the ${nodeTypeLabel})`}
                onClickButton={() => setHasRegisterNodeModal(true)}
                Icon={NodeIcon}
                disabled={!isLoggedIn || (nodeType === 'mainnet' && !profile)}
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
        {rows.length > 0 && (
          <TableContainer>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.tableHeadRow}>
                  <TableCell className={classes.tableHeadCell}>Status</TableCell>
                  <TableCell className={classes.tableHeadCell}>Name</TableCell>
                  <TableCell className={classes.tableHeadCell}>Expected Yield</TableCell>
                  {nodeType === 'mainnet' && (
                    <TableCell className={classes.tableHeadCell}>Commission</TableCell>
                  )}
                  <TableCell className={classes.tableHeadCell}>Delegation</TableCell>
                  <TableCell className={classes.tableHeadCell}>Available for Delegation</TableCell>
                  <TableCell className={classes.tableHeadCell} colSpan={2}>
                    Ranking
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow className={classes.tableRow}>
                    <TableCell className={classes.tableCell}>{row.status}</TableCell>
                    <TableCell className={classes.tableCell}>{row.name}</TableCell>
                    <TableCell className={classes.tableCell}>{row.expectedYield}</TableCell>
                    {nodeType === 'mainnet' && (
                      <TableCell className={classes.tableCell}>{row.commission}</TableCell>
                    )}
                    <TableCell className={classes.tableCell}>{row.totalDelegation}</TableCell>
                    <TableCell className={classes.tableCell}>{row.availableDelegation}</TableCell>
                    <TableCell className={classes.tableCell}>{row.rank}</TableCell>
                    <TableCell className={classes.tableCell} align="right">
                      {row.actions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <References isLoggedIn={isLoggedIn} setHasRegisterNodeModal={setHasRegisterNodeModal} />
      </div>
    </div>
  );
};

export default RunNode;
