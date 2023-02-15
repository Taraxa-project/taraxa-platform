import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';

import { AmountCard, Button, Checkbox, Icons, ProfileIcon } from '@taraxa_project/taraxa-ui';

import useCMetamask from '../../services/useCMetamask';
import useChain from '../../services/useChain';

import Title from '../../components/Title/Title';
import { useDelegationApi } from '../../services/useApi';
import useValidators from '../../services/useValidators';

import Delegation from '../../interfaces/BackendDelegation';
import { Validator } from '../../interfaces/Validator';

import { weiToEth } from '../../utils/eth';

import './node-profile-page.scss';
import Modals from './Modal/Modals';

// interface BarFlexProps {
//   communityDelegated: number;
//   selfDelegated: number;
//   availableDelegation: number;
// }

// const BarFlex = ({ communityDelegated, selfDelegated, availableDelegation }: BarFlexProps) => {
//   let cdParsed = communityDelegated;
//   let sdParsed = selfDelegated;
//   let adParsed = availableDelegation;
//   if (cdParsed + sdParsed + adParsed > 100) {
//     /**
//      * Highest number = 100 - sum of lowest numbers
//      */
//     if (cdParsed >= sdParsed && cdParsed >= adParsed) cdParsed = 100 - (sdParsed + adParsed);
//     if (sdParsed >= cdParsed && sdParsed >= adParsed) sdParsed = 100 - (cdParsed + adParsed);
//     if (adParsed >= cdParsed && adParsed >= sdParsed) adParsed = 100 - (sdParsed + cdParsed);
//   }
//   return (
//     <div className="barFlex">
//       <div
//         className="percentageAmount"
//         style={{
//           width: `${cdParsed}%`,
//         }}
//       >
//         <div className="barPercentage" style={{ background: '#15AC5B' }} />
//       </div>
//       <div
//         className="percentageAmount"
//         style={{
//           width: `${sdParsed}%`,
//         }}
//       >
//         <div className="barPercentage" style={{ background: '#8E8E8E' }} />
//       </div>
//       <div
//         className="percentageAmount"
//         style={{
//           width: `${adParsed}%`,
//         }}
//       >
//         <div className="barPercentage" style={{ background: '#48BDFF' }} />
//       </div>
//     </div>
//   );
// };

const NodeProfilePage = () => {
  const { provider } = useChain();
  const { status, account } = useCMetamask();
  const { getValidator } = useValidators();
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [delegationCount, setDelegationCount] = useState<number>(0);
  const [delegations, setDelegations] = useState<Delegation[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(1);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const { address } = useParams<{ address?: string }>();
  const delegationApi = useDelegationApi();

  const canDelegate = status === 'connected' && !!account && !validator?.isFullyDelegated;
  const canUndelegate = status === 'connected' && !!account;

  const fetchNode = useCallback(async () => {
    if (address) {
      setValidator(await getValidator(address));
    }
  }, [address]);

  const fetchDelegators = useCallback(async () => {
    const data = await delegationApi.get(
      `/validators/${address}/delegations?show_my_delegation_at_the_top=${delegationAtTop}&page=${delegationPage}`,
    );
    if (data.success) {
      setDelegations(data.response.data);
      setDelegationCount(data.response.count);
    } else {
      setDelegations([]);
      setDelegationCount(0);
    }
  }, [address, delegationAtTop, delegationPage]);

  useEffect(() => {
    fetchNode();
    fetchDelegators();
  }, [fetchNode, fetchDelegators]);

  useEffect(() => {
    (async () => {
      if (status === 'connected' && account && provider) {
        setBalance(await provider.getBalance(account));
      }
    })();
  }, [status, account, provider]);

  // const delegationPossible = (node?.totalDelegation || 0) + (node?.remainingDelegation || 0);
  // const communityDelegated = Math.max(
  //   Math.round(
  //     (((node?.totalDelegation || 0) - (node?.ownDelegation || 0)) / delegationPossible) * 100,
  //   ),
  //   1,
  // );
  // const selfDelegated = Math.max(
  //   Math.round(((node?.ownDelegation || 0) / delegationPossible) * 100),
  //   1,
  // );
  // const availableDelegation = Math.max(
  //   Math.round(((node?.remainingDelegation || 0) / delegationPossible) * 100),
  //   1,
  // );
  const delegationTotalPages = Math.ceil(delegationCount / 20);
  const offsetIndex = delegationPage === 1 ? 0 : 20 * (delegationPage - 1);
  // const nodeActiveSince = new Date(validator?.firstBlockCreatedAt || Date.now());

  if (!validator) {
    return null;
  }
  return (
    <div className="runnode">
      <Modals
        balance={balance}
        delegateToValidator={delegateToValidator}
        undelegateFromValidator={undelegateFromValidator}
        onDelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
        }}
        onUndelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
        }}
        onDelegateClose={() => setDelegateToValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
      />
      <Title title="Delegation" />
      <div className="nodeInfoWrapper">
        <div className="nodeInfoFlex">
          <div className="nodeInfoColumn">
            <div className="nodeTitle">
              <ProfileIcon title={validator.address} size={40} />
              {validator.address}
            </div>
            <div className="nodeAddress">{validator.address}</div>
            <div className="nodeInfoTitle">expected yield</div>
            <div className="nodeInfoContent">20%</div>
            <div className="nodeInfoTitle">commission</div>
            <div className="nodeInfoContent">{validator.commission.toFixed(2)}%</div>
            {validator.description && (
              <>
                <div className="nodeInfoTitle">node operator description</div>
                <div className="nodeInfoContent">{validator.description}</div>
              </>
            )}
            {validator.endpoint && (
              <>
                <div className="nodeInfoTitle">node operator Website</div>
                <div className="nodeInfoContent">
                  <a rel="nofollow" href={validator.endpoint}>
                    {validator.endpoint}
                  </a>
                </div>
              </>
            )}
            {/* {validator?.firstBlockCreatedAt && (
              <>
                <div className="nodeInfoTitle">node active since</div>
                <div className="nodeInfoContent">{`${nodeActiveSince.getDate()} ${nodeActiveSince
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase()} ${nodeActiveSince.getFullYear().toString().substring(2)}`}</div>
              </>
            )} */}
          </div>
          <div className="nodeDelegationColumn">
            <div className="taraContainerWrapper">
              <div className="taraContainer">
                <AmountCard
                  amount={ethers.utils.commify(weiToEth(validator.availableForDelegation))}
                  unit="TARA"
                />
                <div className="taraContainerAmountDescription">Available for delegation</div>
              </div>
              <div className="taraContainer">
                <AmountCard
                  amount={ethers.utils.commify(weiToEth(validator.delegation))}
                  unit="TARA"
                />
                <div className="taraContainerAmountDescription">Total delegated</div>
              </div>
            </div>
            <div className="nodeDelegationSplit">
              {/* <BarFlex
                communityDelegated={communityDelegated}
                selfDelegated={selfDelegated}
                availableDelegation={availableDelegation}
              /> */}
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
                onClick={() => setDelegateToValidator(validator)}
                variant="contained"
                color="secondary"
                label="Delegate"
                disabled={!canDelegate}
              />
              <Button
                onClick={() => setUndelegateFromValidator(validator)}
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
