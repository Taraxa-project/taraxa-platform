/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useCallback, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useParams } from 'react-router-dom';

import { AmountCard, Button, Checkbox, Icons, ProfileIcon } from '@taraxa_project/taraxa-ui';

import Delegation from '../../interfaces/Delegation';
import useDelegation from '../../services/useDelegation';
import useCMetamask from '../../services/useCMetamask';
import useChain from '../../services/useChain';

import Title from '../../components/Title/Title';
import useValidators from '../../services/useValidators';

import { Validator } from '../../interfaces/Validator';

import { stripEth, weiToEth } from '../../utils/eth';

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
  const { getDelegations } = useDelegation();
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [delegationAtTop, setDelegationAtTop] = useState<boolean>(false);
  const [validator, setValidator] = useState<Validator | null>(null);
  const [delegationCount, setDelegationCount] = useState<number>(0);
  const [delegations, setDelegations] = useState<Delegation[] | []>([]);
  const [delegationPage, setDelegationPage] = useState<number>(1);
  const [delegateToValidator, setDelegateToValidator] = useState<Validator | null>(null);
  const [undelegateFromValidator, setUndelegateFromValidator] = useState<Validator | null>(null);
  const { address } = useParams<{ address?: string }>();
  const [shouldFetch, setShouldFetch] = useState(false);

  const canDelegate = status === 'connected' && !!account && !validator?.isFullyDelegated;
  const canUndelegate = status === 'connected' && !!account;

  const fetchNode = useCallback(async () => {
    if (address) {
      setValidator(await getValidator(address));
    }
  }, [address]);

  const fetchDelegators = useCallback(async () => {
    if (address) {
      const delegations = await getDelegations(address);
      setDelegations(delegations);
      setDelegationCount(delegations.length);
    } else {
      setDelegations([]);
      setDelegationCount(0);
    }
  }, [address, delegationAtTop, delegationPage]);

  useEffect(() => {
    fetchNode();
    fetchDelegators();
  }, [fetchNode, fetchDelegators, shouldFetch]);

  useEffect(() => {
    (async () => {
      if (status === 'connected' && account && provider) {
        setBalance(await provider.getBalance(account));
      }
    })();
  }, [status, account, provider]);

  // const delegationPossible =
  //   validator?.delegation
  //     .add(validator?.availableForDelegation)
  //     .div(BigNumber.from('10').pow(BigNumber.from('18')))
  //     ?.toNumber() || 1;

  // const ownDelegation =
  //   delegations.length > 0
  //     ? delegations
  //         .find((d) => d.address.toLowerCase() === validator?.owner?.toLowerCase())
  //         ?.stake?.div(BigNumber.from('10').pow(BigNumber.from('18')))
  //         ?.toNumber() || 0
  //     : delegationPossible;

  // const communityDelegated =
  //   delegations.length > 0
  //     ? Math.max(
  //         Math.round(
  //           (parseFloat(
  //             validator?.delegation
  //               ?.div(BigNumber.from('10').pow(BigNumber.from('18')))
  //               ?.toString() || '1',
  //           ) -
  //             ownDelegation / delegationPossible) *
  //             100,
  //         ),
  //         1,
  //       )
  //     : 0;

  // const selfDelegated = Math.max(Math.round((ownDelegation / delegationPossible) * 100), 1);

  // const availableForDelegation = parseFloat(
  //   validator?.availableForDelegation
  //     ?.div(BigNumber.from('10').pow(BigNumber.from('18')))
  //     ?.toString() || '0',
  // );

  // const availableDelegation = Math.max(
  //   Math.round((availableForDelegation / delegationPossible) * 100),
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
        reDelegatableBalance={ethers.BigNumber.from('0')}
        delegatableValidators={[]}
        delegateToValidator={delegateToValidator}
        undelegateFromValidator={undelegateFromValidator}
        onDelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onUndelegateSuccess={() => {
          // getBalances();
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onReDelegateSuccess={() => {
          fetchNode();
          fetchDelegators();
          setShouldFetch(true);
        }}
        onDelegateClose={() => setDelegateToValidator(null)}
        onDelegateFinish={() => setDelegateToValidator(null)}
        onUndelegateClose={() => setUndelegateFromValidator(null)}
        onUndelegateFinish={() => setUndelegateFromValidator(null)}
        claimAmount={BigNumber.from('0')}
        claimRewardsFromValidator={null}
        onClaimSuccess={() => {}}
        onClaimFinish={() => {}}
        onClaimClose={() => {}}
      />
      <Title title="Delegation" />
      <div className="nodeInfoWrapper">
        <div className="nodeInfoFlex">
          <div className="nodeInfoColumn">
            <div className="nodeTitle">
              <ProfileIcon title={validator.address} size={40} />
              <div>{validator.address}</div>
            </div>
            <div className="nodeAddress">{validator.address}</div>
            <div className="nodeInfoTitle">expected yield</div>
            <div className="nodeInfoContent">20%</div>
            <div className="nodeInfoTitle">commission</div>
            <div className="nodeInfoContent">{validator.commission.toFixed(1)}%</div>
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
            {/* <div className="nodeDelegationSplit">
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
            </div> */}
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
                    {delegator.address.toLowerCase() === account?.toLowerCase() && (
                      <div className="ownStake">your delegation</div>
                    )}
                  </div>
                  <div className="amount">{stripEth(delegator.stake)} TARA</div>
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
