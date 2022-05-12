import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { BigNumber, ethers } from 'ethers';

import {
  ProfileBasicCard,
  Text,
  ProfileCard,
  Button,
  Tooltip,
  ProfileSubmissionsCard,
  Checkbox,
} from '@taraxa_project/taraxa-ui';

import { Typography } from '@material-ui/core';
import { GreenCircledCheckIconBig } from '../../assets/icons/greenCircledCheck';
import WalletIcon from '../../assets/icons/wallet';
import { useClaimApi, useWalletAuthorizationApi } from '../../services/useApi';
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
import { ethToWei, weiToEth, formatEth, roundEth } from '../../utils/eth';

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
  const claimApi = useClaimApi();
  const authorizationApi = useWalletAuthorizationApi();
  const [showLockedPoints, setShowLockedPoints] = useState(false);
  const [availableToBeClaimed, setAvailableToBeClaimed] = useState(ethers.BigNumber.from(0));
  const [lockedPoints, setLockedPoints] = useState(ethers.BigNumber.from(0));
  const [calculatedPoints, setCalculatedPoints] = useState<BigNumber>(ethers.BigNumber.from(0));
  const [addressAuthorized, setAddressAuthorized] = useState<boolean>(false);

  const authorizeAddress = async () => {
    if (!account) return;
    try {
      const authorizationProm = await authorizationApi.post(`/${account}`, {});
      if (authorizationProm.success) {
        const result = authorizationProm.response;
        setAddressAuthorized(result);
      }
    } catch (error) {
      setAddressAuthorized(false);
    }
  };

  useEffect(() => {
    const checkAuhorizationStatus = async () => {
      if (!account) return;
      try {
        const authorizationAddressProm = await authorizationApi.get(`/${account}`);
        if (authorizationAddressProm && authorizationAddressProm.success) {
          const returnedAddress = authorizationAddressProm.response;
          if (account === ethers.utils.getAddress(returnedAddress)) {
            setAddressAuthorized(true);
          } else {
            setAddressAuthorized(false);
          }
        }
      } catch (error) {
        setAddressAuthorized(false);
      }
    };
    checkAuhorizationStatus();
  }, [account]);

  useEffect(() => {
    if (!account) {
      return;
    }

    claimApi
      .post(`/accounts/${account}`, {})
      .then((data) => {
        const { availableToBeClaimed, totalLocked } = data.response;

        setAvailableToBeClaimed(ethers.BigNumber.from(availableToBeClaimed));
        setLockedPoints(ethers.BigNumber.from(totalLocked));
      })
      .catch(() => {
        setAvailableToBeClaimed(ethers.BigNumber.from(0));
        setLockedPoints(ethers.BigNumber.from(0));
      });
  }, [account]);

  useEffect(() => {
    if (!account) {
      setCalculatedPoints(ethToWei(points.toString()));
    } else {
      let calculated = ethers.BigNumber.from(availableToBeClaimed);
      if (showLockedPoints) {
        calculated = calculated.add(lockedPoints);
      }
      setCalculatedPoints(calculated);
    }
  }, [account, points, availableToBeClaimed, lockedPoints, showLockedPoints]);

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

  const isLockedPointsChecked = !account || showLockedPoints;

  return (
    <>
      <div className="cardContainer">
        <ProfileCard
          username={auth.user!.username}
          email={auth.user!.email}
          wallet={
            auth.user!.eth_wallet ? auth.user!.eth_wallet : 'No Ethereum Wallet Address was set'
          }
          addressWarning={!addressAuthorized}
          Icon={TaraxaIcon}
          buttonOptions={buttons}
        />
        <ViewProfileDetailsKYC openKYCModal={openKYCModal} />
        <ProfileBasicCard
          title="My Rewards"
          value={formatEth(roundEth(weiToEth(calculatedPoints)))}
          buttonOptions={
            <Button
              variant="contained"
              color="secondary"
              label="Go to redeem page"
              disabled={calculatedPoints.eq('0')}
              fullWidth
              onClick={() => history.push('/redeem')}
            />
          }
        >
          <div className="flexExpand">
            {!account && 'TARA'}
            {account && isLockedPointsChecked && 'Total TARA'}
            {account && !isLockedPointsChecked && 'Redeemable TARA'}
            <div className="lockedPointsCheckbox">
              <Checkbox
                checked={isLockedPointsChecked}
                disabled={!account}
                onChange={(e) => setShowLockedPoints(e.target.checked)}
              />
              Show locked points
            </div>
          </div>
        </ProfileBasicCard>
        <br />
      </div>
      <div className="cardContainer">
        {addressAuthorized ? (
          <ProfileBasicCard title="Wallet" Icon={WalletIcon}>
            <div
              className="flexExpand"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <GreenCircledCheckIconBig />
              <Typography variant="h6" />
              <span style={{ color: '#878CA4' }}>{account}</span>
            </div>
          </ProfileBasicCard>
        ) : (
          <ProfileBasicCard
            title="Wallet"
            Icon={WalletIcon}
            buttonOptions={
              <Button
                variant="contained"
                color="secondary"
                label="Authorize via MetaMask"
                disabled={calculatedPoints.eq('0')}
                fullWidth
                onClick={() => authorizeAddress()}
              />
            }
          >
            <div
              className="flexExpand"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <span>Not authorized</span>
              <span style={{ color: '#878CA4' }}>
                Click “Authorize via MetaMask” to be able to login via MetaMask.
              </span>
            </div>
          </ProfileBasicCard>
        )}
      </div>
    </>
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
