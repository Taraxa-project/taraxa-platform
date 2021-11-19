import React from 'react';
import { RewardCard } from '@taraxa_project/taraxa-ui';

import Markdown from '../../components/Markdown';

import { useAuth } from '../../services/useAuth';
import { formatTime } from '../../utils/time';

import { Bounty } from './bounty';

interface BountyCardProps {
  bounty: Bounty;
  goTo: (url: string) => void;
  isDetailed?: boolean;
  description?: JSX.Element;
  submissions?: JSX.Element;
}

function BountyCard({ bounty, goTo, isDetailed, description, submissions }: BountyCardProps) {
  const auth = useAuth();
  const now = new Date().getTime();
  const endTime = new Date(bounty.end_date).getTime();
  const dateDiff = Math.ceil((endTime - now) / 1000);

  let expiration;
  let isInfinite = false;

  if (now > endTime) {
    expiration = 'Expired';
  } else {
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    if (dateDiff > oneYearInSeconds) {
      expiration = 'Never Expires';
      isInfinite = true;
    } else {
      expiration = formatTime(dateDiff);
    }
  }

  let onClickButton;
  let onClickText = 'Submit';

  console.log(bounty);

  if (isDetailed && bounty.active && auth.isLoggedIn) {
    const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;
    if (submissionNeeded) {
      if (!bounty.allow_multiple_submissions && bounty.userSubmissionsCount! >= 1) {
        onClickText = 'Already submitted';
      } else {
        onClickButton = () => goTo(`/bounties/${bounty.id}/submit`);
      }
    } else {
      onClickText = 'No submission necessary';
    }
  } else if (!bounty.id) {
    onClickText = 'Loading...';
  } else if (!bounty.active) {
    onClickText = 'Bounty inactive';
  } else if (!isDetailed) {
    onClickText = 'Learn more';
    onClickButton = () => goTo(`/bounties/${bounty.id}`);
  }

  return (
    <RewardCard
      key={bounty.id}
      title={bounty.name}
      description={description || <Markdown>{bounty.reward_text}</Markdown>}
      onClickButton={onClickButton}
      onClickText={onClickText}
      reward={bounty.reward || 'Loading...'}
      submissions={bounty.submissionsCount}
      expiration={expiration}
      isActive={bounty.active}
      isInfinite={isInfinite}
      dataList={submissions || undefined}
    />
  );
}

export default BountyCard;
