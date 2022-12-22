import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { ethers } from "ethers";
import { useMediaQuery } from "react-responsive";
import {
  Modal,
  Notification,
  BaseCard,
  IconCard,
  Tooltip,
  Text,
  Button,
  Card,
  ProfileIcon,
  AmountCard,
} from "@taraxa_project/taraxa-ui";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import CloseIcon from "../../assets/icons/close";
import NodeCommissionChangeIcon from "../../assets/icons/nodeCommissionChange";
import NodeIcon from "../../assets/icons/node";
import InfoIcon from "../../assets/icons/info";

import { useAuth } from "../../services/useAuth";
import { useDelegationApi } from "../../services/useApi";
import OwnNode from "../../interfaces/OwnNode";
import Title from "../../components/Title/Title";

import RegisterNode from "./Modal/RegisterNode";
import CreateOrEditProfile, { Profile } from "./Screen/CreateOrEditProfile";
import EditNode from "./Screen/EditNode";

import "./runnode.scss";

interface RunNodeModalProps {
  hasRegisterNodeModal: boolean;
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void;
  getNodes: () => void;
  nodeType: "mainnet" | "testnet";
}

const RunNodeModal = ({
  hasRegisterNodeModal,
  setHasRegisterNodeModal,
  getNodes,
  nodeType,
}: RunNodeModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  if (!hasRegisterNodeModal) {
    return null;
  }

  const modal = (
    <RegisterNode
      type={nodeType}
      onSuccess={() => {
        getNodes();
        setHasRegisterNodeModal(false);
      }}
    />
  );

  return (
    <Modal
      id={isMobile ? "mobile-signinModal" : "signinModal"}
      title="Register Node"
      show={hasRegisterNodeModal}
      children={modal}
      parentElementID="root"
      onRequestClose={() => {
        setHasRegisterNodeModal(false);
      }}
      closeIcon={CloseIcon}
    />
  );
};

interface ReferencesProps {
  isLoggedIn: boolean;
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void;
}

const References = ({
  isLoggedIn,
  setHasRegisterNodeModal,
}: ReferencesProps) => {
  return (
    <div className="box">
      <Text
        label="References"
        variant="h6"
        color="primary"
        className="box-title"
      />
      <Button
        label="How do I install a node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            "https://docs.taraxa.io/node-setup/testnet_node_setup",
            "_blank",
            "noreferrer noopener"
          )
        }
      />
      <Button
        label="Where do I find my address?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            "https://docs.taraxa.io/node-setup/node_address",
            "_blank",
            "noreferrer noopener"
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
            "https://docs.taraxa.io/node-setup/upgrade-a-node/software-upgrade",
            "_blank",
            "noreferrer noopener"
          )
        }
      />
      <Button
        label="How do I reset my node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            "https://docs.taraxa.io/node-setup/upgrade-a-node/data-reset",
            "_blank",
            "noreferrer noopener"
          )
        }
      />
      <Button
        label="I need help!"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            "https://taraxa.io/discord",
            "_blank",
            "noreferrer noopener"
          )
        }
      />
    </div>
  );
};

const RunNode = () => {
  const auth = useAuth();
  const delegationApi = useDelegationApi();

  const isLoggedIn = !!auth.user?.id;

  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nodeType, setNodeType] = useState<"mainnet" | "testnet">("mainnet");
  const [hasRegisterNodeModal, setHasRegisterNodeModal] = useState(false);
  const [currentEditedNode, setCurrentEditedNode] = useState<null | OwnNode>(
    null
  );

  const [nodes, setNodes] = useState<OwnNode[]>([]);
  const [mainnetNodes, setMainnetNodes] = useState<OwnNode[]>([]);
  const [testnetNodes, setTestnetNodes] = useState<OwnNode[]>([]);
  const [blocksProduced, setBlocksProduced] = useState("0");
  const [weeklyRating, setWeeklyRating] = useState("N/A");
  const [profile, setProfile] = useState<Profile | undefined>(undefined);

  const getProfile = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    const data = await delegationApi.get("/profiles", true);
    if (!data.success) {
      return;
    }

    setProfile(data.response);
  }, [isLoggedIn]);

  useEffect(() => {
    delegationApi
      .get(`/nodes?type=testnet`, true)
      .then((r) => {
        if (r.success) setTestnetNodes(r.response);
      })
      .catch(() => setTestnetNodes([]));
    delegationApi
      .get(`/nodes?type=mainnet`, true)
      .then((r) => {
        if (r.success) setMainnetNodes(r.response);
      })
      .catch(() => setMainnetNodes([]));
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const getNodes = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    const data = await delegationApi.get(`/nodes?type=${nodeType}`, true);
    if (!data.success) {
      return;
    }

    setNodes(data.response);

    let totalProduced = 0;
    let weeklyRank: number;
    data.response.forEach((node: any) => {
      if (node.blocksProduced) {
        totalProduced += node.blocksProduced;
      }

      if (node.weeklyRank) {
        if (weeklyRank) {
          weeklyRank = Math.min(weeklyRank, node.weeklyRank);
        } else {
          weeklyRank = node.weeklyRank;
        }
      }
    });

    if (weeklyRank!) {
      setWeeklyRating(`#${weeklyRank}`);
    }
    setBlocksProduced(ethers.utils.commify(totalProduced));
  }, [nodeType, isLoggedIn]);

  useEffect(() => {
    getNodes();
  }, [getNodes]);

  const deleteNode = async (node: OwnNode) => {
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

  if (currentEditedNode) {
    return (
      <EditNode
        node={currentEditedNode}
        closeEditNode={(refreshNodes) => {
          setCurrentEditedNode(null);
          if (refreshNodes) {
            getNodes();
          }
        }}
      />
    );
  }

  const rows = nodes.map((node: OwnNode) => {
    let className = "dot";
    if (node.isActive) {
      className += " active";
    }
    const status = (
      <div className="status">
        <div className={className} />
      </div>
    );

    const name = formatNodeName(
      !node.name || node.name === "" ? node.address : node.name
    );
    const expectedYield = `${node.yield}%`;
    const currentCommission =
      node.type === "mainnet" ? `${node.currentCommission}%` : null;
    const pendingCommission = node.hasPendingCommissionChange
      ? `${node.pendingCommission}%`
      : null;
    const hasPendingCommissionChange = node.hasPendingCommissionChange;
    const totalDelegation = ethers.utils.commify(node.totalDelegation);
    const remainingDelegation = ethers.utils.commify(node.remainingDelegation);
    const weeklyRank = node.weeklyRank ? `#${node.weeklyRank}` : "N/A";
    const weeklyBlocksProduced = node.weeklyBlocksProduced;

    const actions = (
      <>
        <Button
          size="small"
          label="Edit"
          variant="contained"
          color="secondary"
          className="smallBtn"
          style={{ marginBottom: "5px" }}
          onClick={() => {
            setCurrentEditedNode(node);
          }}
        />
        <Button
          size="small"
          label="Delete"
          color="primary"
          variant="outlined"
          className="smallBtn"
          disabled={!node.canDelete}
          onClick={() => {
            const confirmation = window.confirm(
              "Are you sure you want to delete this node? You won't be able to add a node with the same wallet address."
            );
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
      currentCommission,
      pendingCommission,
      hasPendingCommissionChange,
      totalDelegation,
      remainingDelegation,
      weeklyRank,
      actions,
      weeklyBlocksProduced,
    };
  });

  const nodeTypeLabel =
    nodeType === "mainnet" ? "Mainnet Candidate" : "Testnet";

  return (
    <div className="runnode">
      <RunNodeModal
        hasRegisterNodeModal={hasRegisterNodeModal}
        setHasRegisterNodeModal={setHasRegisterNodeModal}
        getNodes={getNodes}
        nodeType={nodeType}
      />
      <div className="runnode-content">
        <Title title="Running a Node" />
        {isLoggedIn &&
          (profile ? (
            <Card className="nodeProfile">
              <div className="nodeProfileInfo">
                <div className="userNameIcon">
                  <ProfileIcon title={auth.user!.username} size={40} />
                  <Text
                    label={auth.user!.username}
                    variant="h5"
                    color="primary"
                    className="profileTitle"
                  />
                </div>
                {profile.description && (
                  <>
                    <Text
                      label="Description"
                      variant="h6"
                      color="primary"
                      className="profileSubtitle"
                    />
                    <p>{profile.description}</p>
                  </>
                )}
                {profile.website && (
                  <>
                    <Text
                      label="Website"
                      variant="h6"
                      color="primary"
                      className="profileSubtitle"
                    />
                    <p>
                      <a
                        href={profile.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {profile.website}
                      </a>
                    </p>
                  </>
                )}
                {profile.social && (
                  <>
                    <Text
                      label="Social"
                      variant="h6"
                      color="primary"
                      className="profileSubtitle"
                    />
                    <p>
                      <a href={profile.social} rel="noreferrer" target="_blank">
                        {profile.social}
                      </a>
                    </p>
                  </>
                )}
              </div>
              <div className="nodeProfileNodesInfo">
                <div className="userNodeInfo">
                  <AmountCard
                    unit="Mainnet nodes"
                    amount={mainnetNodes.length.toString()}
                  />
                  <AmountCard
                    unit="Testnet nodes"
                    amount={testnetNodes.length.toString()}
                  />
                  <AmountCard
                    unit="TARA"
                    amount={mainnetNodes
                      .reduce((a, b) => a + b.totalDelegation, 0)
                      .toString()}
                  />
                  <AmountCard
                    unit="TARA"
                    amount={mainnetNodes
                      .reduce((a, b) => a + b.remainingDelegation, 0)
                      .toString()}
                  />
                  <div className="boxLegend">
                    Delegation received on mainnet
                  </div>
                  <div className="boxLegend">Open delegation on mainnet</div>
                </div>
                <Button
                  label="Update profile"
                  className="referenceButton"
                  variant="contained"
                  onClick={() => setIsEditingProfile(true)}
                />
              </div>
            </Card>
          ) : (
            <Card className="noProfile">
              <p>
                Setup your node runner profile to be able to register Mainnet
                nodes.
              </p>
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
            <div className="nodeTitleContainer">
              <NodeIcon />
              <Text
                label="My nodes"
                variant="h6"
                color="primary"
                className="box-title"
              />
              <Button
                size="small"
                className={clsx(
                  "nodeTypeTab",
                  nodeType === "mainnet" && "active"
                )}
                label="Mainnet Candidate"
                variant="contained"
                onClick={() => {
                  setNodeType("mainnet");
                }}
              />
              <Button
                size="small"
                className={clsx(
                  "nodeTypeTab",
                  nodeType === "testnet" && "active"
                )}
                label="Testnet"
                variant="contained"
                onClick={() => {
                  setNodeType("testnet");
                }}
              />
            </div>
            <Button
              size="medium"
              className="registerNode"
              label={
                nodeType === "mainnet" && !profile
                  ? `Please create your profile to register a node (on the ${nodeTypeLabel})`
                  : `Register a node (on the ${nodeTypeLabel})`
              }
              variant="contained"
              color="secondary"
              disabled={nodeType === "mainnet" && !profile}
              onClick={() => setHasRegisterNodeModal(true)}
            />
          </div>
        )}
        <div className="cardContainer">
          {nodes.length > 0 && (
            <>
              <BaseCard
                title={`${nodes.filter((node) => node.isActive).length}`}
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
                  nodeType === "mainnet" && !profile
                    ? "Please create your profile to register a node."
                    : "Register a node you’ve aleady set up."
                }
                onClickText={`Register a node (on the ${nodeTypeLabel})`}
                onClickButton={() => setHasRegisterNodeModal(true)}
                Icon={NodeIcon}
                disabled={!isLoggedIn || (nodeType === "mainnet" && !profile)}
              />
              <IconCard
                title="Set up a node"
                description="Learn how to set up a node on Taraxa’s testnet."
                onClickText="Set up a node"
                onClickButton={() =>
                  window.open(
                    "https://docs.taraxa.io/node-setup/testnet_node_setup",
                    "_blank",
                    "noreferrer noopener"
                  )
                }
                Icon={NodeIcon}
              />
            </>
          )}
        </div>
        {rows.length > 0 && (
          <TableContainer>
            <Table className="table">
              <TableHead>
                <TableRow className="tableHeadRow">
                  <TableCell className="tableHeadCell">Status</TableCell>
                  <TableCell className="tableHeadCell">Name</TableCell>
                  <TableCell className="tableHeadCell">
                    Expected Yield
                  </TableCell>
                  {nodeType === "mainnet" && (
                    <>
                      <TableCell className="tableHeadCell">
                        Commission
                      </TableCell>
                      <TableCell className="tableHeadCell">
                        Delegation
                      </TableCell>
                      <TableCell className="tableHeadCell">
                        Available for Delegation
                      </TableCell>
                    </>
                  )}
                  {nodeType === "testnet" && (
                    <TableCell className="tableHeadCell">
                      Number of blocks produced
                    </TableCell>
                  )}
                  <TableCell className="tableHeadCell" colSpan={2}>
                    Ranking
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, id) => (
                  <TableRow className="tableRow" key={id}>
                    <TableCell className="tableCell">{row.status}</TableCell>
                    <TableCell className="tableCell">{row.name}</TableCell>
                    <TableCell className="tableCell">
                      {row.expectedYield}
                    </TableCell>
                    {nodeType === "mainnet" && (
                      <>
                        <TableCell className="tableCell">
                          {row.hasPendingCommissionChange ? (
                            <>
                              <NodeCommissionChangeIcon />{" "}
                              <span className="commissionDisplayPendingChange">
                                {row.currentCommission} ➞{" "}
                                {row.pendingCommission}
                              </span>
                            </>
                          ) : (
                            row.currentCommission
                          )}
                        </TableCell>
                        <TableCell className="tableCell">
                          {row.totalDelegation}
                        </TableCell>
                        <TableCell className="tableCell">
                          {row.remainingDelegation}
                        </TableCell>
                      </>
                    )}
                    {nodeType === "testnet" && (
                      <TableCell className="tableCell">
                        {row.weeklyBlocksProduced}
                      </TableCell>
                    )}
                    <TableCell className="tableCell">
                      {row.weeklyRank}
                    </TableCell>
                    <TableCell className="tableCell" align="right">
                      {row.actions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <References
          isLoggedIn={isLoggedIn}
          setHasRegisterNodeModal={setHasRegisterNodeModal}
        />
      </div>
    </div>
  );
};

export default RunNode;
