import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import {
  Modal,
  Notification,
  Text,
  Tooltip,
  TopCard,
  BaseCard,
  DataCard,
  InputField,
  Button,
  Chip,
} from '@taraxa_project/taraxa-ui';
import { useDelegationApi } from '../../services/useApi';
import PublicNode from '../../interfaces/PublicNode';
import Reward from '../../interfaces/Reward';

import CloseIcon from '../../assets/icons/close';
import InfoIcon from '../../assets/icons/info';
import TrophyIcon from '../../assets/icons/trophy';

import StakingSuccess from './Modal/StakingSuccess';
import StakingError from './Modal/StakingError';
import Approve from './Modal/Approve';
import IsStaking from './Modal/IsStaking';
import IsUnstaking from './Modal/IsUnstaking';

import { formatTime } from '../../utils/time';
import { weiToEth, formatEth, roundEth } from '../../utils/eth';

import useToken from '../../services/useToken';
import useStaking from '../../services/useStaking';
import { useAuth } from '../../services/useAuth';

import Title from '../../components/Title/Title';

import './staking.scss';
import useCMetamask from '../../services/useCMetamask';

interface StakingModalProps {
  isSuccess: boolean;
  isError: boolean;
  isApprove: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  setIsSuccess: (isSuccess: boolean) => void;
  setIsError: (isError: boolean) => void;
  setIsApprove: (isApprove: boolean) => void;
  setIsStaking: (isStaking: boolean) => void;
  setIsUnstaking: (isUnstaking: boolean) => void;
  stakedAmount: string;
  currentStakeBalance: string;
  balance: string;
  lockingPeriod: string;
  transactionHash: null | string;
}

function StakingModal({
  isSuccess,
  isError,
  isApprove,
  isStaking,
  isUnstaking,
  setIsSuccess,
  setIsError,
  setIsApprove,
  setIsStaking,
  setIsUnstaking,
  stakedAmount,
  currentStakeBalance,
  balance,
  lockingPeriod,
  transactionHash,
}: StakingModalProps) {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  let modal = <></>;

  if (isSuccess) {
    modal = (
      <StakingSuccess
        lockingPeriod={lockingPeriod}
        transactionHash={transactionHash}
        onSuccess={() => {
          setIsSuccess(false);
        }}
      />
    );
  }

  if (isError) {
    modal = (
      <StakingError
        amount={balance}
        onSuccess={() => {
          setIsError(false);
        }}
      />
    );
  }

  if (isApprove) {
    modal = <Approve amount={stakedAmount} />;
  }

  if (isStaking) {
    modal = <IsStaking amount={stakedAmount} />;
  }

  if (isUnstaking) {
    modal = <IsUnstaking amount={currentStakeBalance} />;
  }

  return (
    <Modal
      id={isMobile ? 'mobile-signinModal' : 'signinModal'}
      title="Test"
      show={isStaking || isUnstaking || isApprove || isSuccess || isError}
      children={modal}
      parentElementID="root"
      onRequestClose={() => {
        setIsSuccess(false);
        setIsError(false);
        setIsApprove(false);
        setIsStaking(false);
        setIsUnstaking(false);
      }}
      closeIcon={CloseIcon}
    />
  );
}

function StakingNotifications() {
  const { status } = useCMetamask();
  const auth = useAuth();
  return (
    <>
      {status !== 'connected' && (
        <div className="notification">
          <Notification
            title="Notice:"
            text="You are not connected to the Metamask wallet"
            variant="danger"
          />
        </div>
      )}

      {auth.user !== null && auth.user.kyc !== 'APPROVED' && (
        <div className="notification">
          <Notification
            title="Notice:"
            text="In order to participate in staking and receive rewards, you must first pass KYC"
            variant="danger"
          />
        </div>
      )}
      <div className="notification">
        <Notification
          title="Info:"
          text="Please Note: Lifetime yield is now updated monthly after 20th of each month, including both staking yields and node commissions."
          variant="info"
        />
      </div>
    </>
  );
}

function StakingTop() {
  const topData = (
    <div>
      <div className="top-data-header">
        <Text label="Top stakers" variant="body1" color="primary" />
        <Text label="See full list" variant="body1" color="primary" />
      </div>
      <table cellSpacing="8">
        <tr>
          <td>1.</td>
          <td>
            <TrophyIcon /> vitalik
          </td>
          <td>0xe08c0 ... 29b34</td>
          <td>4,000,000 TARA</td>
        </tr>
        <tr>
          <td>2.</td>
          <td>
            <TrophyIcon /> username2
          </td>
          <td>0xe08c0 ... 29b34</td>
          <td>800,000 TARA</td>
        </tr>
        <tr>
          <td>3.</td>
          <td>
            <TrophyIcon /> mark_cuban
          </td>
          <td>0xe08c0 ... 29b34</td>
          <td>750,000 TARA</td>
        </tr>
      </table>
    </div>
  );
  return (
    <div>
      <TopCard title="23,124,123" description="Total TARA Staked" topData={topData} />
    </div>
  );
}

interface StakeProps {
  setIsSuccess: (isSuccess: boolean) => void;
  setIsApprove: (isApprove: boolean) => void;
  setIsStaking: (isStaking: boolean) => void;
  setIsUnstaking: (isUnstaking: boolean) => void;
  tokenBalance: ethers.BigNumber;
  setTokenBalance: (tokenBalance: ethers.BigNumber) => void;
  setToStake: (toStake: ethers.BigNumber) => void;
  stakeInput: string;
  setStakeInput: (stakeInput: string) => void;
  currentStakeBalance: ethers.BigNumber;
  setCurrentStakeBalance: (currentStakeBalance: ethers.BigNumber) => void;
  lockingPeriod: ethers.BigNumber;
  setTransactionHash: (transactionHash: null | string) => void;
}

function Stake({
  setIsSuccess,
  setIsApprove,
  setIsStaking,
  setIsUnstaking,
  tokenBalance,
  setTokenBalance,
  setToStake,
  stakeInput,
  setStakeInput,
  currentStakeBalance,
  setCurrentStakeBalance,
  lockingPeriod,
  setTransactionHash,
}: StakeProps) {
  const { account, status } = useCMetamask();
  const auth = useAuth();
  const history = useHistory();
  const delegationApi = useDelegationApi();
  const isLoggedIn = !!auth.user?.id;

  const token = useToken();
  const staking = useStaking();

  const [hasStake, setHasStake] = useState(false);
  const [canClaimStake, setCanClaimStake] = useState(false);
  const [currentStakeEndDate, setCurrentStakeEndDate] = useState<Date | null>(null);
  const [unDelegatedStake, setUndelegatedStake] = useState<ethers.BigNumber>(
    ethers.BigNumber.from('0'),
  );
  const [reward, setReward] = useState('0');

  const [stakeInputError, setStakeInputError] = useState<string | null>(null);

  const [delegators, setDelegators] = useState<PublicNode[]>([]);

  const resetStake = useCallback(() => {
    setHasStake(false);
    setCanClaimStake(false);
    setCurrentStakeBalance(ethers.BigNumber.from('0'));
    setCurrentStakeEndDate(null);
  }, [setHasStake, setCanClaimStake, setCurrentStakeBalance, setCurrentStakeEndDate]);

  const formatStakeInputValue = (value: string) => {
    const stakeInputValue = value.replace(/[^\d.]/g, '');
    let input;
    if (stakeInputValue === '') {
      input = ethers.BigNumber.from('0');
    } else {
      input = ethers.utils.parseUnits(stakeInputValue);
    }
    return input;
  };

  useEffect(() => {
    if (isLoggedIn)
      delegationApi
        .get('/validators?show_fully_delegated=true&show_my_validators=true', isLoggedIn)
        .then((data) => {
          if (data.success) {
            setDelegators(data.response);
          }
        });
  }, [isLoggedIn]);

  useEffect(() => {
    if (account) {
      delegationApi.get(`/delegations/${account}/balances`, isLoggedIn).then((data) => {
        if (data.success) {
          setUndelegatedStake(ethers.BigNumber.from(data.response.remaining));
        }
      });
    }
  }, [account]);

  useEffect(() => {
    const getStakedBalance = async () => {
      if (!staking) {
        return;
      }

      try {
        const currentStake = await staking.stakeOf(account);

        const currentStakeBalance = currentStake[0];
        const currentStakeStartDate = currentStake[1].toNumber();
        let currentStakeEndDate = currentStake[2].toNumber();

        if (
          currentStakeBalance.toString() === '0' ||
          currentStakeStartDate === 0 ||
          currentStakeEndDate === 0
        ) {
          resetStake();
          return;
        }

        const currentTimestamp = Math.ceil(new Date().getTime() / 1000);
        const canClaimStake = currentTimestamp > currentStakeEndDate;

        currentStakeEndDate = new Date(currentStakeEndDate * 1000);

        setHasStake(true);
        setCanClaimStake(canClaimStake);
        setCurrentStakeBalance(currentStakeBalance);
        setCurrentStakeEndDate(currentStakeEndDate);
      } catch (e) {
        resetStake();
      }
    };

    getStakedBalance();
  }, [account, token, staking, resetStake, setCurrentStakeBalance]);

  useEffect(() => {
    if (account) {
      delegationApi.get(`/rewards/total?address=${account}`).then((data) => {
        if (data.success) {
          const rewards = data.response;
          if (rewards.length > 0) {
            const reward = rewards[0];
            setReward(reward.amount.toFixed(3));
          }
        }
      });
    }
  }, [account]);

  const stakeTokens = async () => {
    setStakeInputError(null);

    const value = formatStakeInputValue(stakeInput);
    setStakeInput(formatEth(weiToEth(value)));
    setToStake(value);

    if (value.isZero()) {
      return;
    }

    if (value.gt(tokenBalance)) {
      setStakeInputError('Not enough tokens available');
      return;
    }

    if (!token || !staking) {
      return;
    }

    const allowance = await token.allowance(account, process.env.REACT_APP_STAKING_ADDRESS!);

    if (value.gt(allowance)) {
      setIsApprove(true);
      try {
        const approveTx = await token.approve(process.env.REACT_APP_STAKING_ADDRESS!, value);
        await approveTx.wait(1);
      } catch (err) {
        return;
      } finally {
        setIsApprove(false);
      }
    }

    try {
      setIsStaking(true);
      const stakeTx = await staking.stake(value);
      setTransactionHash(stakeTx.hash);
      await stakeTx.wait(1);

      setIsStaking(false);
      setIsSuccess(true);

      const newBalance = tokenBalance.sub(value);
      setTokenBalance(newBalance);
      setToStake(newBalance);
      setStakeInput(formatEth(weiToEth(newBalance)));

      const currentTimestamp = Math.ceil(new Date().getTime() / 1000);

      setHasStake(true);
      setCanClaimStake(false);
      setCurrentStakeBalance(currentStakeBalance.add(value));
      setCurrentStakeEndDate(new Date((currentTimestamp + lockingPeriod.toNumber()) * 1000));
    } catch (err) {
      setTransactionHash(null);
      setIsStaking(false);
      setIsSuccess(false);
    }
  };

  const unstakeTokens = async () => {
    if (!token || !staking) {
      return;
    }

    setIsUnstaking(true);
    try {
      const unstakeTx = await staking.unstake();
      await unstakeTx.wait(1);
    } catch (err) {
      return;
    } finally {
      setIsUnstaking(false);
    }

    const newBalance = tokenBalance.add(currentStakeBalance);
    setTokenBalance(newBalance);
    setToStake(newBalance);
    setStakeInput(formatEth(weiToEth(newBalance)));

    resetStake();
  };

  const downloadRewards = useCallback(async () => {
    delegationApi.get(`/rewards?address=${account}`).then((data) => {
      if (data.success) {
        const header = [
          'Type',
          'Epoch',
          'Start Date',
          'End Date',
          'Reward',
          'Node ID',
          'Node Name',
          'Node Address',
          'Node Commission',
          'Original Amount',
        ];

        const csv: string[] = [];
        csv.push(header.join(','));

        data.response.forEach((reward: Reward) => {
          const startsAt = new Date(reward.startsAt).toLocaleString();
          const endsAt = new Date(reward.endsAt).toLocaleString();
          const row = [
            reward.type,
            reward.epoch,
            ['"', startsAt, '"'].join(''),
            ['"', endsAt, '"'].join(''),
            reward.value,
            reward.node ? reward.node.id : '',
            reward.node ? ['"', reward.node.name.replace(/[\r\n",]+/gm, ''), '"'].join('') : '',
            reward.node ? reward.node.address : '',
            reward.commission,
            reward.originalAmount,
          ];
          csv.push(row.join(','));
        });

        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `rewards-${account}.csv`);
        a.click();
      }
    });
  }, [account]);

  const stakeInputField = (
    <InputField
      type="text"
      className="whiteInput"
      label=""
      color="secondary"
      placeholder="Enter amount..."
      variant="outlined"
      margin="normal"
      error={stakeInputError !== null}
      helperText={stakeInputError !== null ? stakeInputError : ''}
      fullWidth
      value={status !== 'connected' ? '' : stakeInput}
      onChange={(event) => setStakeInput(event.target.value)}
      disabled={auth.user !== null && auth.user.kyc !== 'APPROVED'}
    />
  );

  const chips = [25, 50, 75, 100].map((percentage) => {
    const value = tokenBalance.mul(ethers.BigNumber.from(percentage)).div(100);
    const input = formatStakeInputValue(stakeInput);

    const chipsTrigger = (selectedPercentage: number) => {
      const newValue = tokenBalance.mul(ethers.BigNumber.from(selectedPercentage)).div(100);
      setStakeInput(formatEth(weiToEth(newValue)));
      setToStake(newValue);
    };

    return (
      <Chip
        key={percentage}
        label={`${percentage}%`}
        onClick={() => chipsTrigger(percentage)}
        variant="filled"
        clickable
        className={
          value.gt(ethers.BigNumber.from('0')) && value.eq(input) ? 'chipSelected' : 'chip'
        }
        disabled={auth.user !== null && auth.user.kyc !== 'APPROVED'}
      />
    );
  });
  const stakingchips = <>{chips}</>;

  return (
    <>
      <div className="cardContainer">
        <BaseCard
          title={formatEth(reward)}
          description="Lifetime yield"
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Total number of TARA staking rewards earned for the lifetime of the connected wallet."
              Icon={InfoIcon}
            />
          }
          button={
            <Button
              disabled={!account}
              variant="outlined"
              color="secondary"
              onClick={() => downloadRewards()}
              label="Download rewards"
              size="small"
            />
          }
        />
        <BaseCard
          title={formatEth(roundEth(weiToEth(currentStakeBalance)))}
          description="My staked TARA"
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Total number of TARA currently staked in the staking contract for connected wallet."
              Icon={InfoIcon}
            />
          }
          button={
            <Button
              disabled={!canClaimStake}
              variant="outlined"
              color="secondary"
              onClick={() => unstakeTokens()}
              label="Unstake"
              size="small"
            />
          }
        />
        <BaseCard
          title={delegators.length.toString()}
          description="Validators delegated"
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Number of validators you delegated TARA to."
              Icon={InfoIcon}
            />
          }
          button={
            <Button
              disabled={delegators.length === 0}
              variant="outlined"
              color="secondary"
              onClick={() => history.push('/delegation?show_my_delegators')}
              label="My validators"
              size="small"
            />
          }
        />
      </div>
      <div className="cardContainer">
        <BaseCard
          title="20.0%"
          description="Lifetime annualized staking yield, %"
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Effective annualized yield, this could be different than the stated expected yields due to special community events."
              Icon={InfoIcon}
            />
          }
        />
        <BaseCard
          title={formatEth(roundEth(weiToEth(unDelegatedStake)))}
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Total number of TARA staked currently that weren't delegated to any validators."
              Icon={InfoIcon}
            />
          }
          description="Un-Delegated stake"
        />
      </div>
      <div className="cardContainer">
        <DataCard
          title={status === 'connected' ? formatEth(roundEth(weiToEth(tokenBalance))) : 'N/A'}
          description="Available to Stake"
          label="TARA"
          onClickButton={() => stakeTokens()}
          onClickText="Stake"
          input={stakeInputField}
          tooltip={
            <Tooltip
              title="Total number of TARA currently in the connected wallet that could be staked."
              Icon={InfoIcon}
            />
          }
          dataOptions={stakingchips}
          disabled={auth.user !== null && auth.user.kyc !== 'APPROVED'}
        />
        <DataCard
          title={status === 'connected' ? formatEth(roundEth(weiToEth(unDelegatedStake))) : 'N/A'}
          description="Delegate"
          label="TARA"
          onClickButton={() => history.push('/delegation')}
          onClickText="Delegate to validators"
          descriptionLegend="You MUST delegate your stake to earn yields."
          tooltip={
            <Tooltip
              title="Total number of TARA staked currently that aren't earning any yield."
              Icon={InfoIcon}
            />
          }
          disabled={unDelegatedStake.isZero()}
        />
        {hasStake && currentStakeEndDate !== null && (
          <BaseCard
            title={formatEth(roundEth(weiToEth(currentStakeBalance)))}
            description={`Locked till ${currentStakeEndDate.toLocaleDateString()}`}
          />
        )}
      </div>
    </>
  );
}

function Staking() {
  const { account } = useCMetamask();
  const token = useToken();
  const staking = useStaking();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [toStake, setToStake] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [stakeInput, setStakeInput] = useState('0.0');
  const [currentStakeBalance, setCurrentStakeBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from('0'),
  );

  const [lockingPeriod, setLockingPeriod] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(30 * 24 * 60 * 60),
  );

  const [transactionHash, setTransactionHash] = useState<null | string>(null);

  useEffect(() => {
    const getTokenBalance = async () => {
      if (!token) {
        return;
      }

      try {
        const balance = await token.balanceOf(account);
        setTokenBalance(balance);
        setToStake(balance);
        setStakeInput(formatEth(weiToEth(balance)));
      } catch (e) {
        setTokenBalance(ethers.BigNumber.from('0'));
        setToStake(ethers.BigNumber.from('0'));
        setStakeInput('0.0');
      }
    };

    const getLockingPeriod = async () => {
      if (!staking) {
        return;
      }

      try {
        const currentLockingPeriod = await staking.lockingPeriod();
        setLockingPeriod(currentLockingPeriod);
      } catch (e) {
        setLockingPeriod(ethers.BigNumber.from(30 * 24 * 60 * 60));
      }
    };

    getTokenBalance();
    getLockingPeriod();
  }, [account, token, staking]);

  return (
    <>
      <StakingModal
        isSuccess={isSuccess}
        isError={isError}
        isApprove={isApprove}
        isStaking={isStaking}
        isUnstaking={isUnstaking}
        setIsSuccess={setIsSuccess}
        setIsError={setIsError}
        setIsApprove={setIsApprove}
        setIsStaking={setIsStaking}
        setIsUnstaking={setIsUnstaking}
        stakedAmount={formatEth(roundEth(weiToEth(toStake)))}
        currentStakeBalance={formatEth(roundEth(weiToEth(currentStakeBalance)))}
        balance={formatEth(roundEth(weiToEth(tokenBalance)))}
        lockingPeriod={formatTime(lockingPeriod.toNumber())}
        transactionHash={transactionHash}
      />
      <div className="stakingRoot">
        <Title
          title="Staking: Phase 3 - Mainnet candidate"
          subtitle={
            <Text variant="body2" color="textSecondary">
              Earn rewards and help test &amp; secure the Taraxa’s network
              <a
                href="https://docs.taraxa.io/faq/mainnet-candidate"
                target="_blank"
                rel="noreferrer"
                className="default-link"
              >
                Go to FAQ -&gt;
              </a>
            </Text>
          }
          tooltip="The Mainnet Candidate is meant to be a candidate network to be able to host native TARA tokens and become a fully-featured decentralized network, the last step to a truly decentralized Taraxa network!"
        />
        <StakingNotifications />
        {false && <StakingTop />}
        <Stake
          setIsSuccess={setIsSuccess}
          setIsApprove={setIsApprove}
          setIsStaking={setIsStaking}
          setIsUnstaking={setIsUnstaking}
          tokenBalance={tokenBalance}
          setTokenBalance={setTokenBalance}
          setToStake={setToStake}
          stakeInput={stakeInput}
          setStakeInput={setStakeInput}
          currentStakeBalance={currentStakeBalance}
          setCurrentStakeBalance={setCurrentStakeBalance}
          lockingPeriod={lockingPeriod}
          setTransactionHash={setTransactionHash}
        />
      </div>
    </>
  );
}

export default Staking;
