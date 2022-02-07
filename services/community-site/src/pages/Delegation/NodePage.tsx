import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { toSvg } from 'jdenticon';

import { Button, Checkbox, Icons } from '@taraxa_project/taraxa-ui';

import Title from '../../components/Title/Title';
import { useDelegationApi } from '../../services/useApi';
import Delegation from '../../interfaces/Delegation';
import PublicNode from '../../interfaces/PublicNode';

import './nodePage.scss';

const NodePage = () => {
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [node, setNode] = useState<PublicNode | null>(null);
  const [delegationCount, setDelegationCount] = useState<number>(0);
  const [delegations, setDelegations] = useState<Delegation[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(1);
  const { nodeId } = useParams<{ nodeId?: string }>();
  const delegationApi = useDelegationApi();
  const nodeIcon = toSvg('Aweesome node 1', 40, { backColor: '#fff' });

  const fetchNode = useCallback(async () => {
    const data = await delegationApi.get(`/validators/${nodeId}`);
    if (data.success) {
      setNode(data.response);
      // eslint-disable-next-line no-console
      console.log(data.response);
      // eslint-disable-next-line no-console
      console.log(node);
    }
  }, [nodeId]);

  const fetchDelegators = useCallback(async () => {
    setDelegations([]);
    const data = await delegationApi.get(
      `/validators/${nodeId}/delegations?show_my_delegation_at_the_top=${delegationAtTop}&page=${delegationPage}`,
    );
    if (data.success) {
      setDelegations(data.response.data);
      setDelegationCount(data.response.count);
    }
  }, [nodeId, delegationAtTop, delegationPage]);

  useEffect(() => {
    fetchNode();
    fetchDelegators();
  }, [fetchNode, fetchDelegators]);

  const delegationPossible = (node?.totalDelegation || 0) + (node?.remainingDelegation || 0);
  const communityDelegated =
    (((node?.totalDelegation || 0) - (node?.ownDelegation || 0)) / delegationPossible) * 100;
  const selfDelegated = ((node?.ownDelegation || 0) / delegationPossible) * 100;
  const availableDelegation = ((node?.remainingDelegation || 0) / delegationPossible) * 100;
  const delegationTotalPages = Math.ceil(delegationCount / 20);
  const offsetIndex = delegationPage === 1 ? 0 : 20 * (delegationPage - 1);

  if (!node) {
    return null;
  }
  return (
    <div className="runnode">
      <Title title="Delegation" />
      <div className="nodeInfoWrapper">
        <div className="nodeInfoFlex">
          <div className="nodeInfoColumn">
            <div className="nodeTitle">
              <div
                // eslint-disable-next-line
                dangerouslySetInnerHTML={{ __html: nodeIcon }}
              />
              {node?.name}
            </div>
            <div className="nodeAddress">{node?.address}</div>
            <div className="nodeInfoTitle">expected yield</div>
            <div className="nodeInfoContent">{node?.yield.toFixed(2)}%</div>
            <div className="nodeInfoTitle">commission</div>
            <div className="nodeInfoContent">{node?.currentCommission?.toFixed(2)}%</div>
            <div className="nodeInfoTitle">node operator description</div>
            <div className="nodeInfoContent">{node?.profile?.description}</div>
            <div className="nodeInfoTitle">node operator Website</div>
            <div className="nodeInfoContent">
              <a href="https://t.me/awesome_node">{node?.profile?.website}</a>
            </div>
            <div className="nodeInfoTitle">node active since</div>
            <div className="nodeInfoContent">30 DEC 2021</div>
          </div>
          <div className="nodeDelegationColumn">
            <div className="taraContainerWrapper">
              <div className="taraContainer">
                <div className="taraContainerAmount">
                  <div className="taraContainerAmountTotal">{node?.remainingDelegation}</div>
                  <div className="taraContainerUnit">TARA</div>
                </div>
                <div className="taraContainerAmountDescription">Available for delegation</div>
              </div>
              <div className="taraContainer">
                <div className="taraContainerAmount">
                  <div className="taraContainerAmountTotal">{node?.totalDelegation}</div>
                  <div className="taraContainerUnit">TARA</div>
                </div>
                <div className="taraContainerAmountDescription">Total delegated</div>
              </div>
            </div>
            <div className="nodeDelegationSplit">
              <div className="barFlex">
                <div
                  className="percentageAmount"
                  style={{
                    width: `${communityDelegated}}%`,
                    display: communityDelegated >= 1 ? 'flex' : 'none',
                  }}
                >
                  <div className="barPercentage" style={{ background: '#15AC5B' }} />
                </div>
                <div
                  className="percentageAmount"
                  style={{
                    width: `${selfDelegated}%`,
                    display: selfDelegated >= 1 ? 'flex' : 'none',
                  }}
                >
                  <div className="barPercentage" style={{ background: '#8E8E8E' }} />
                </div>
                <div
                  className="percentageAmount"
                  style={{
                    width: `${availableDelegation}%`,
                    display: availableDelegation >= 1 ? 'flex' : 'none',
                  }}
                >
                  <div className="barPercentage" style={{ background: '#48BDFF' }} />
                </div>
              </div>
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
              <Button variant="contained" color="secondary" label="Delegate" />
              <Button variant="contained" color="secondary" label="Un-Delegate" />
            </div>
          </div>
        </div>
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
          {delegations.map((delegator, dIndex) => (
            <div className="delegatorRow">
              <div className="address">
                <span>{dIndex + 1 + offsetIndex}.</span> {delegator.address}
              </div>
              <div className="badges">
                {delegator.isSelfDelegation && <div className="selfStake">self-stake</div>}
                {delegator.isOwnDelegation && <div className="ownStake">your delegation</div>}
              </div>
              <div className="amount">{delegator.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodePage;
