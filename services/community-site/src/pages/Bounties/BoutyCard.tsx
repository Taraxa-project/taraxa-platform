import { RewardCard } from '@taraxa_project/taraxa-ui';

import Markdown from '../../components/Markdown';

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
  let onClickText = 'Learn more';

  if (isDetailed) {
    if (bounty.active) {
      const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;
      if (submissionNeeded) {
        onClickButton = () => goTo(`/bounties/${bounty.id}/submit`);
        onClickText = 'Submit';
      } else {
        onClickText = 'No submission necessary';
      }
    } else {
      onClickText = 'Bounty inactive';
    }
  } else {
    onClickButton = () => goTo(`/bounties/${bounty.id}`);
  }

  return (
    <RewardCard
      key={bounty.id}
      title={bounty.name}
      description={description ? description : <Markdown>{bounty.reward_text}</Markdown>}
      onClickButton={onClickButton}
      onClickText={onClickText}
      reward={bounty.reward}
      submissions={bounty.submissionsCount}
      expiration={expiration}
      isActive={bounty.active}
      isInfinite={isInfinite}
      dataList={submissions ? submissions : undefined}
    />
  );
}

export default BountyCard;
