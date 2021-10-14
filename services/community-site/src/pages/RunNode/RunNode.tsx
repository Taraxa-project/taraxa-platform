import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useMediaQuery } from 'react-responsive'
import { useHistory } from "react-router-dom";
import {
  Notification,
  BaseCard,
  IconCard,
  Tooltip,
  Text,
  Button,
} from '@taraxa_project/taraxa-ui'

import CloseIcon from '../../assets/icons/close'
import NodeIcon from '../../assets/icons/node'
import InfoIcon from '../../assets/icons/info'
import EditIcon from '../../assets/icons/edit'
import DeleteIcon from '../../assets/icons/delete'
import LeftIcon from '../../assets/icons/left'
import RightIcon from '../../assets/icons/right'

import { useAuth } from '../../services/useAuth'
import { useApi } from '../../services/useApi'

import Modal from "../../components/Modal/Modal"
import Title from '../../components/Title/Title'

import RegisterNode from './Modal/RegisterNode'
import UpdateNode from './Modal/UpdateNode'

import './runnode.scss'

interface Node {
  id: number
  name: string
  ethWallet: string
  active: boolean
  topPosition: null | number
  blocksProduced: number
  lastMinedBlockDate: null | Date
}

const RunNode = () => {
  const auth = useAuth()
  const api = useApi()

  const isLoggedIn = auth.user?.id

  const [hasRegisterNodeModal, setHasRegisterNodeModal] = useState(false)
  const [hasUpdateNodeModal, setHasUpdateNodeModal] = useState(false)
  const [currentEditedNode, setCurrentEditedNode] = useState<null | Node>(null)

  const [nodes, setNodes] = useState<Node[]>([])
  const [blocksProduced, setBlocksProduced] = useState('0')
  const [weeklyRating, setWeeklyRating] = useState('N/A')
  const [page, setPage] = useState(1)

  const getNodes = useCallback(async () => {
    const data = await api.get(`/nodes?_limit=-1`, true)
    if (!data.success) {
      return
    }
    const nodes: Node[] = data.response
      .map((node: Partial<Node>) => {
        if (node.lastMinedBlockDate !== null) {
          return {
            ...node,
            lastMinedBlockDate: new Date(node.lastMinedBlockDate!),
          }
        }
        return node
      })
      .map((node: Partial<Node>) => {
        let active = false
        if (node.lastMinedBlockDate !== null) {
          const now = new Date()
          const diff = Math.ceil(
            (now.getTime() - node.lastMinedBlockDate!.getTime()) / 1000
          )
          if (diff / 60 < 120) {
            active = true
          }
        }
        return {
          ...node,
          active,
        }
      })
    setNodes(nodes)

    function notEmpty<TValue>(
      value: TValue | null | undefined
    ): value is TValue {
      return value !== null && value !== undefined
    }

    const nodesWithTopPosition = nodes
      .map((node) => node.topPosition)
      .filter(notEmpty)
    if (nodesWithTopPosition.length > 0) {
      const rating = Math.min(...nodesWithTopPosition)
      setWeeklyRating(`#${rating}`)
    }

    const produced = nodes
      .map((node) => node.blocksProduced)
      .reduce((acc, blocks) => acc + blocks, 0)
    setBlocksProduced(ethers.utils.commify(produced.toString()))
  }, [])

  useEffect(() => {
    getNodes()
  }, [getNodes])

  const deleteNode = async (node: Node) => {
    await api.del(`/nodes/${node.id}`, true)
    getNodes()
  }

  const formatNodeName = (name: string) => {
    if (name.length <= 17) {
      return name
    }
    return `${name.substr(0, 7)} ... ${name.substr(-5)}`
  }

  const nodesPerPage = 12
  const totalPages = Math.ceil(nodes.length / nodesPerPage)
  const start = (page - 1) * nodesPerPage
  const end = start + nodesPerPage
  const paginatedNodes = nodes.slice(start, end)

  const rows = paginatedNodes.map((node) => {
    let className = 'dot'
    if (node.active) {
      className += ' active'
    }
    return (
      <div key={node.id}>
        <div className="status">
          <div className={className}></div>
        </div>
        <div className="address">
          {formatNodeName(
            !node.name || node.name === '' ? node.ethWallet : node.name
          )}
        </div>
        <Button
          size="small"
          Icon={EditIcon}
          className="edit"
          onClick={() => {
            setCurrentEditedNode(node)
            setHasUpdateNodeModal(true)
          }}
        />
        <Button
          size="small"
          Icon={DeleteIcon}
          className="delete"
          onClick={() => {
            const confirmation = window.confirm(
              'Are you sure you want to delete this node?'
            )

            if (confirmation) {
              deleteNode(node)
            }
          }}
        />
      </div>
    )
  })

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
        {nodes.length === 0 && (
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
                    'noreferrer noopener'
                  )
                }
                Icon={NodeIcon}
              />
            </>
          )}
        </div>
        {nodes.length > 0 && (
          <div className="box">
            <Text
              label="Active Nodes"
              variant="h6"
              color="primary"
              className="box-title"
            />
            <div className="box-pagination">
              <div className="box-pagination-info">
                <Text label={`Page ${page}/${totalPages}`} />
              </div>
              <div className="box-pagination-buttons">
                <Button
                  size="small"
                  Icon={LeftIcon}
                  className="left"
                  disabled={page === 1}
                  onClick={() => {
                    setPage((page) => page - 1)
                  }}
                />
                <Button
                  size="small"
                  Icon={RightIcon}
                  className="right"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((page) => page + 1)
                  }}
                />
              </div>
            </div>
            <div className="box-list">
              {[0, 1, 2].map((col) => {
                const l = col * 4
                const r = rows.slice(l, l + 4)
                return (
                  <div key={col} className="box-list-col">
                    {r}
                  </div>
                )
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
                'https://docs.taraxa.io/node-setup/testnet_node_setup',
                '_blank',
                'noreferrer noopener'
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
                'noreferrer noopener'
              )
            }
          />
          <Button
            label="How do I register my node?"
            className="referenceButton"
            variant="contained"
            onClick={() => setHasRegisterNodeModal(true)}
          />
          <Button
            label="How do I upgrade my node?"
            className="referenceButton"
            variant="contained"
            onClick={() =>
              window.open(
                'https://docs.taraxa.io/node-setup/upgrade-a-node/software-upgrade',
                '_blank',
                'noreferrer noopener'
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
                'noreferrer noopener'
              )
            }
          />
          <Button
            label="I need help!"
            className="referenceButton"
            variant="contained"
            onClick={() =>
              window.open(
                'https://taraxa.io/discord',
                '_blank',
                'noreferrer noopener'
              )
            }
          />
        </div>
      </div>
    </div>
  )
}

interface RunNodeModalProps {
  hasRegisterNodeModal: boolean
  setHasRegisterNodeModal: (hasRegisterNodeModal: boolean) => void
  hasUpdateNodeModal: boolean
  setHasUpdateNodeModal: (hasUpdateNodeModal: boolean) => void
  getNodes: () => void
  currentEditedNode: null | Node
}

const RunNodeModal = ({
  hasRegisterNodeModal,
  hasUpdateNodeModal,
  setHasRegisterNodeModal,
  setHasUpdateNodeModal,
  getNodes,
  currentEditedNode,
}: RunNodeModalProps) => {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` })
  const history = useHistory();
  let modalContent

  if (hasRegisterNodeModal) {
    modalContent = (
      <RegisterNode
        onSuccess={() => {
          getNodes()
          setHasRegisterNodeModal(false)
        }}
      />
    )
  }

  if (hasUpdateNodeModal && currentEditedNode !== null) {
    modalContent = (
      <UpdateNode
        id={currentEditedNode.id}
        name={currentEditedNode.name}
        onSuccess={() => {
          getNodes()
          setHasUpdateNodeModal(false)
        }}
      />
    )
  }

  if (!modalContent) {
    return null
  }

  return (
    <Modal
      title={hasUpdateNodeModal && currentEditedNode ? 'Update a node' : 'Register a node'}
      onClose={() =>{
        setHasRegisterNodeModal(false);
        setHasUpdateNodeModal(false);
        history.push('/node');
      }}
      content={modalContent}
      classes={isMobile ? 'mobileModal' : ''}
    />
  )
}

export default RunNode
