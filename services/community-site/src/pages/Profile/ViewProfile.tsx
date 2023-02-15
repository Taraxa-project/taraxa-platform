import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';

import {
  ProfileBasicCard,
  Text,
  ProfileCard,
  Button,
  Tooltip,
  ProfileSubmissionsCard,
  Checkbox,
} from '@taraxa_project/taraxa-ui';

import { useDelegationApi, useClaimApi } from '../../services/useApi';
import BountyIcon from '../../assets/icons/bounties';
import TaraxaIcon from '../../assets/icons/taraxaIcon';
import InfoIcon from '../../assets/icons/info';
import KYCIcon from '../../assets/icons/kyc';
import SuccessIcon from '../../assets/icons/success';
import ErrorIcon from '../../assets/icons/error';

import { formatTime } from '../../utils/time';

import { useAuth } from '../../services/useAuth';
import useSubmissions from '../../services/useSubmissions';
import Title from '../../components/Title/Title';
import useCMetamask from '../../services/useCMetamask';
import { formatEth, weiToEth } from '../../utils/eth';

interface ViewProfileDetailsKYCProps {
  openKYCModal: () => void;
}

function ViewProfileDetailsKYC({ openKYCModal }: ViewProfileDetailsKYCProps) {
  const auth = useAuth();
  const { kyc } = auth.user!;

  const empty = [null, '', '-', 'NOT_STARTED'];
  const hasKYC = ![...empty, 'VERIFYING'].includes(kyc);
  const kycStatus = ![...empty].includes(kyc) ? kyc : 'NOT_STARTED';

  const status: { [string: string]: string } = {
    NOT_STARTED: 'Not sumbitted',
    VERIFYING: 'Verifying...',
    APPROVED: 'Approved',
    DENIED: 'Denied',
  };

  let kycButton;
  let kycIcon;

  if (!hasKYC) {
    kycButton = (
      <Button
        variant="contained"
        color="secondary"
        label="Verify"
        fullWidth
        onClick={() => openKYCModal()}
      />
    );
  }

  if (kycStatus === 'APPROVED') {
    kycIcon = <SuccessIcon />;
  }

  if (kycStatus === 'DENIED') {
    kycIcon = <ErrorIcon />;
  }

  return (
    <ProfileBasicCard
      title="KYC"
      description={status[kycStatus]}
      Icon={KYCIcon}
      buttonOptions={kycButton}
    >
      {kycIcon}
    </ProfileBasicCard>
  );
}

interface ViewProfileDetailsProps {
  points: number;
  openEditProfile: () => void;
  openKYCModal: () => void;
}

function ViewProfileDetails({ points, openEditProfile, openKYCModal }: ViewProfileDetailsProps) {
  const auth = useAuth();
  const { account } = useCMetamask();
  const history = useHistory();
  const delegationApi = useDelegationApi();
  const claimApi = useClaimApi();
  const [showTotalPoints, setShowTotalPoints] = useState(false);
  const [rewards, setRewards] = useState(0);
  const [availableToBeClaimed, setAvailableToBeClaimed] = useState(0);
  const [calculatedPoints, setCalculatedPoints] = useState(0);

  useEffect(() => {
    if (account) {
      claimApi
        .post(`/accounts/${account}`, {})
        .then((data) => {
          if (data.success) {
            const { availableToBeClaimed } = data.response;
            setAvailableToBeClaimed(
              parseFloat(weiToEth(ethers.BigNumber.from(availableToBeClaimed))),
            );
          } else {
            setAvailableToBeClaimed(0);
          }
        })
        .catch(() => {
          setAvailableToBeClaimed(0);
        });
    } else {
      setAvailableToBeClaimed(0);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      delegationApi
        .get(`/rewards/total?address=${account}`)
        .then((data) => {
          if (data.success) {
            const rewards = data.response;
            if (rewards.length > 0) {
              const reward = rewards[0];
              setRewards(parseFloat(reward.amount.toFixed(3)));
            } else {
              setRewards(0);
            }
          } else {
            setRewards(0);
          }
        })
        .catch(() => {
          setRewards(0);
        });
    } else {
      setRewards(0);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      let calculatedPoints = 0;
      if (showTotalPoints) {
        calculatedPoints += points;
        calculatedPoints += rewards;
      } else {
        calculatedPoints += availableToBeClaimed;
      }
      setCalculatedPoints(calculatedPoints);
    } else {
      setCalculatedPoints(points);
    }
  }, [account, showTotalPoints, points, availableToBeClaimed, rewards]);

  const buttons = (
    <>
      <Button
        color="primary"
        variant="outlined"
        label="Edit Profile"
        fullWidth
        onClick={() => openEditProfile()}
      />
      <Button
        style={{ marginTop: '0.5rem' }}
        color="primary"
        variant="text"
        label="Log out"
        fullWidth
        onClick={() => {
          auth.signout!();
          history.push('/');
        }}
      />
    </>
  );

  const isTotalPointsChecked = !account || showTotalPoints;

  return (
    <div className="cardContainer">
      <ProfileCard
        username={auth.user!.username}
        email={auth.user!.email}
        wallet={
          auth.user!.eth_wallet ? auth.user!.eth_wallet : 'No Ethereum Wallet Address was set'
        }
        Icon={TaraxaIcon}
        buttonOptions={buttons}
      />
      <ViewProfileDetailsKYC openKYCModal={openKYCModal} />
      <ProfileBasicCard
        title="My Rewards"
        value={formatEth(calculatedPoints)}
        buttonOptions={
          <Button
            variant="contained"
            color="secondary"
            label="Go to redeem page"
            disabled={calculatedPoints === 0}
            fullWidth
            onClick={() => history.push('/redeem')}
          />
        }
      >
        <div className="flexExpand">
          {!account && 'TARA'}
          {account && isTotalPointsChecked && 'Total TARA'}
          {account && !isTotalPointsChecked && 'Redeemable TARA'}
          <div className="lockedPointsCheckbox">
            <Checkbox
              checked={isTotalPointsChecked}
              disabled={!account}
              onChange={(e) => setShowTotalPoints(e.target.checked)}
            />
            Show total TARA
          </div>
        </div>
      </ProfileBasicCard>
    </div>
  );
}

interface ViewProfileBountiesProps {
  approved: any[];
  rejected: any[];
  review: any[];
}

function ViewProfileBounties({ approved, rejected, review }: ViewProfileBountiesProps) {
  const renderSubmission = (sub: any) => {
    const now = new Date();
    const date = new Date(sub.created_at);
    const dateDiff = Math.ceil((now.getTime() - date.getTime()) / 1000);
    return (
      <div key={sub.id} className="contentGrid">
        <div className="gridLeft">
          <Text
            label={(sub.bounty && sub.bounty.name) || '-'}
            className="profileContentTitle"
            variant="body2"
            color="primary"
          />
          {sub.submission_reward && (
            <Text label={`${sub.submission_reward} TARA`} variant="body2" color="textSecondary" />
          )}
        </div>
        <div className="gridRight">
          <Text label={`${formatTime(dateDiff)} ago`} variant="body2" color="textSecondary" />
        </div>
      </div>
    );
  };

  const noSubmissions = (
    <div>
      <Text
        label="No submissions yet"
        className="noContent"
        variant="body2"
        color="textSecondary"
      />
    </div>
  );

  let approvedContent = noSubmissions;
  let rejectedContent = noSubmissions;
  let reviewContent = noSubmissions;

  if (approved.length > 0) {
    approvedContent = <>{approved.map((sub: any) => renderSubmission(sub))}</>;
  }

  if (rejected.length > 0) {
    rejectedContent = <>{rejected.map((sub: any) => renderSubmission(sub))}</>;
  }

  if (review.length > 0) {
    reviewContent = <>{review.map((sub: any) => renderSubmission(sub))}</>;
  }

  return (
    <>
      <Title title="Bounty submissions" subtitle="" tooltip="" Icon={BountyIcon} size="medium" />
      <div className="cardContainer">
        <ProfileSubmissionsCard
          title="Approved"
          itemsContent={approvedContent}
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Bounty submissions that have been approved and points have been rewarded."
              Icon={InfoIcon}
            />
          }
        />
        <ProfileSubmissionsCard
          title="In Review"
          itemsContent={reviewContent}
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Bounty submissions are being reviewed."
              Icon={InfoIcon}
            />
          }
        />
        <ProfileSubmissionsCard
          title="Rejected"
          itemsContent={rejectedContent}
          tooltip={
            <Tooltip
              className="staking-icon-tooltip"
              title="Bounty submissions that have been rejected."
              Icon={InfoIcon}
            />
          }
        />
      </div>
    </>
  );
}

interface ViewProfileProps {
  openEditProfile: () => void;
  openKYCModal: () => void;
}

const ViewProfile = ({ openEditProfile, openKYCModal }: ViewProfileProps) => {
  const { points, approved, rejected, review } = useSubmissions();
  return (
    <>
      <ViewProfileDetails
        points={points}
        openEditProfile={openEditProfile}
        openKYCModal={openKYCModal}
      />
      <ViewProfileBounties approved={approved} rejected={rejected} review={review} />
    </>
  );
};

export default ViewProfile;
