import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';

import { AmountCard, Button, Checkbox, Icons, ProfileIcon } from '@taraxa_project/taraxa-ui';
import { useMetaMask } from 'metamask-react';

import { useAuth } from '../../services/useAuth';

import Title from '../../components/Title/Title';
import { useDelegationApi } from '../../services/useApi';
import Delegation from '../../interfaces/Delegation';
import PublicNode from '../../interfaces/PublicNode';

import './node-profile-page.scss';
import Modals from './Modal/Modals';

interface BarFlexProps {
  communityDelegated: number;
  selfDelegated: number;
  availableDelegation: number;
}

const BarFlex = ({ communityDelegated, selfDelegated, availableDelegation }: BarFlexProps) => {
  let cdParsed = communityDelegated;
  let sdParsed = selfDelegated;
  let adParsed = availableDelegation;
  if (cdParsed + sdParsed + adParsed > 100) {
    /**
     * Highest number = 100 - sum of lowest numbers
     */
    if (cdParsed >= sdParsed && cdParsed >= adParsed) cdParsed = 100 - (sdParsed + adParsed);
    if (sdParsed >= cdParsed && sdParsed >= adParsed) sdParsed = 100 - (cdParsed + adParsed);
    if (adParsed >= cdParsed && adParsed >= sdParsed) adParsed = 100 - (sdParsed + cdParsed);
  }
  return (
    <div className="barFlex">
      <div
        className="percentageAmount"
        style={{
          width: `${cdParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#15AC5B' }} />
      </div>
      <div
        className="percentageAmount"
        style={{
          width: `${sdParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#8E8E8E' }} />
      </div>
      <div
        className="percentageAmount"
        style={{
          width: `${adParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#48BDFF' }} />
      </div>
    </div>
  );
};

const NodeProfilePage = () => {
  const auth = useAuth();
  const { status, account } = useMetaMask();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [node, setNode] = useState<PublicNode | null>(null);
  const [delegationCount, setDelegationCount] = useState<number>(0);
  const [delegations, setDelegations] = useState<Delegation[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(1);
  const [delegateToNode, setDelegateToNode] = useState<PublicNode | null>(null);
  const [undelegateFromNode, setUndelegateFromNode] = useState<PublicNode | null>(null);
  const { nodeId } = useParams<{ nodeId?: string }>();
  const delegationApi = useDelegationApi();

  const isLoggedIn = !!auth.user?.id;
  const canDelegate = isLoggedIn && status === 'connected' && !!account;
  const canUndelegate = isLoggedIn && status === 'connected' && !!account && node?.canUndelegate;

  const getBalances = useCallback(async () => {
    if (!canDelegate) {
      return;
    }
    const data = await delegationApi.get(`/delegations/${account}/balances`);
    if (data.success) {
      setAvailableBalance(data.response.remaining);
    }
  }, [canDelegate, account]);

  const fetchNode = useCallback(async () => {
    const data = await delegationApi.get(`/validators/${nodeId}`);
    if (data.success) {
      setNode(data.response);
    }
  }, [nodeId]);

  const fetchDelegators = useCallback(async () => {
    const data = await delegationApi.get(
      `/validators/${nodeId}/delegations?show_my_delegation_at_the_top=${delegationAtTop}&page=${delegationPage}`,
    );
    if (data.success) {
      setDelegations(data.response.data);
      setDelegationCount(data.response.count);
    } else {
      setDelegations([]);
      setDelegationCount(0);
    }
  }, [nodeId, delegationAtTop, delegationPage]);

  useEffect(() => {
    getBalances();
    fetchNode();
    fetchDelegators();
  }, [fetchNode, fetchDelegators, getBalances]);

  const delegationPossible = (node?.totalDelegation || 0) + (node?.remainingDelegation || 0);
  const communityDelegated = Math.max(
    Math.round(
      (((node?.totalDelegation || 0) - (node?.ownDelegation || 0)) / delegationPossible) * 100,
    ),
    1,
  );
  const selfDelegated = Math.max(
    Math.round(((node?.ownDelegation || 0) / delegationPossible) * 100),
    1,
  );
  const availableDelegation = Math.max(
    Math.round(((node?.remainingDelegation || 0) / delegationPossible) * 100),
    1,
  );
  const delegationTotalPages = Math.ceil(delegationCount / 20);
  const offsetIndex = delegationPage === 1 ? 0 : 20 * (delegationPage - 1);
  const nodeActiveSince = new Date(node?.firstBlockCreatedAt || Date.now());

  if (!node) {
    return null;
  }
  return (
    <div className="runnode">
      <Modals
        delegateToNode={delegateToNode}
        undelegateFromNode={undelegateFromNode}
        onDelegateSuccess={() => {
          getBalances();
          fetchNode();
          fetchDelegators();
        }}
        onUndelegateSuccess={() => {
          getBalances();
          fetchNode();
          fetchDelegators();
        }}
        onDelegateClose={() => setDelegateToNode(null)}
        onDelegateFinish={() => setDelegateToNode(null)}
        onUndelegateClose={() => setUndelegateFromNode(null)}
        onUndelegateFinish={() => setUndelegateFromNode(null)}
        account={account}
        availableBalance={availableBalance}
      />
      <Title title="Delegation" />
      <div className="nodeInfoWrapper">
        <div className="nodeInfoFlex">
          <div className="nodeInfoColumn">
            <div className="nodeTitle">
              <ProfileIcon title={node?.name} size={40} />
              {node?.name}
            </div>
            <div className="nodeAddress">{node?.address}</div>
            <div className="nodeInfoTitle">expected yield</div>
            <div className="nodeInfoContent">{node?.yield.toFixed(2)}%</div>
            <div className="nodeInfoTitle">commission</div>
            <div className="nodeInfoContent">{node?.currentCommission?.toFixed(2)}%</div>
            {node?.profile?.description && (
              <>
                <div className="nodeInfoTitle">node operator description</div>
                <div className="nodeInfoContent">{node?.profile?.description}</div>
              </>
            )}
            {node?.profile?.website && (
              <>
                <div className="nodeInfoTitle">node operator Website</div>
                <div className="nodeInfoContent">
                  <a rel="nofollow" href={node?.profile?.website}>
                    {node?.profile?.website}
                  </a>
                </div>
              </>
            )}
            {node?.firstBlockCreatedAt && (
              <>
                <div className="nodeInfoTitle">node active since</div>
                <div className="nodeInfoContent">{`${nodeActiveSince.getDay()} ${nodeActiveSince
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase()} ${nodeActiveSince.getFullYear().toString().substring(2)}`}</div>
              </>
            )}
          </div>
          <div className="nodeDelegationColumn">
            <div className="taraContainerWrapper">
              <div className="taraContainer">
                <AmountCard amount={ethers.utils.commify(node?.remainingDelegation)} unit="TARA" />
                <div className="taraContainerAmountDescription">Available for delegation</div>
              </div>
              <div className="taraContainer">
                <AmountCard amount={ethers.utils.commify(node?.totalDelegation)} unit="TARA" />
                <div className="taraContainerAmountDescription">Total delegated</div>
              </div>
            </div>
            <div className="nodeDelegationSplit">
              <BarFlex
                communityDelegated={communityDelegated}
                selfDelegated={selfDelegated}
                availableDelegation={availableDelegation}
              />
              <div className="percentagesBar">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <div className="percentageLegends">
                <div className="percentageLegend">
                  <div className="legendColor" style={{ background: '#15AC5B' }} />
                  community-delegated
                </div>
                <div className="percentageLegend">
                  <div className="legendColor" style={{ background: '#8E8E8E' }} />
                  self-delegated
                </div>
                <div className="percentageLegend">
                  <div className="legendColor" style={{ background: '#48BDFF' }} />
                  available for delegation
                </div>
              </div>
            </div>
            <div className="delegationButtons">
              <Button
                onClick={() => setDelegateToNode(node)}
                variant="contained"
                color="secondary"
                label="Delegate"
                disabled={!canDelegate}
              />
              <Button
                onClick={() => setUndelegateFromNode(node)}
                variant="contained"
                color="secondary"
                label="Un-Delegate"
                disabled={!canUndelegate}
              />
            </div>
          </div>
        </div>
        {delegations.length !== 0 && (
          <>
            <hr className="nodeInfoDivider" />
            <div className="delegatorsHeader">
              <span className="delegatorsLegend">Delegators</span>
              <div className="showOwnDelegation">
                <Checkbox
                  value={delegationAtTop}
                  onChange={(e) => setDelegationAtTop(e.target.checked)}
                />
                Show my delegation at the top
              </div>
              <div className="delegatorsPagination">
                <Button
                  className="paginationButton"
                  onClick={() => setDelegationPage(delegationPage - 1)}
                  disabled={delegationCount <= 20 || delegationPage === 1}
                  Icon={Icons.Left}
                />
                <Button
                  className="paginationButton"
                  onClick={() => setDelegationPage(delegationPage + 1)}
                  disabled={delegationCount <= 20 || delegationPage === delegationTotalPages}
                  Icon={Icons.Right}
                />
              </div>
            </div>
            <div className="tableHeader">
              <span>Address</span>
              <span>Amount of TARA delegated</span>
            </div>
            <div className="delegators">
              {delegations.map((delegator, id) => (
                <div key={id} className="delegatorRow">
                  <div className="address">
                    <span>{id + 1 + offsetIndex}.</span> {delegator.address}
                  </div>
                  <div className="badges">
                    {delegator.isSelfDelegation && <div className="selfStake">self-stake</div>}
                    {delegator.isOwnDelegation && <div className="ownStake">your delegation</div>}
                  </div>
                  <div className="amount">{ethers.utils.commify(delegator.value)} TARA</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NodeProfilePage;
