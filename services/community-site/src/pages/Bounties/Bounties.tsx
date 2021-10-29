import { useEffect, useState } from 'react';
import {
  Text,
  Switch,
  RewardCard,
} from '@taraxa_project/taraxa-ui';

import SubmissionIcon from '../../assets/icons/submission';
import ExpirationIcon from '../../assets/icons/expiration'
import PinnedIcon from '../../assets/icons/pinned';

import Title from '../../components/Title/Title';
import Markdown from '../../components/Markdown';

import { useApi } from '../../services/useApi';

import { formatTime } from '../../utils/time';

import './bounties.scss';

type BountyState = {
  id: number;
};

type Bounty = {
  id: number;
  name: string;
  description: string;
  submission: string;
  reward: string;
  reward_text: string;
  state: BountyState | null;
  submissionsCount?: number;
  end_date: Date;
  active: boolean;
  is_pinned: boolean;
};

function Bounties() {
  const api = useApi();
  const [allBounties, setAllBounties] = useState<Bounty[]>([]);

  useEffect(() => {
    const getBounties = async () => {
      const data = await api.get(`/bounties?_limit=-1`);
      if (!data.success) {
        return;
      }
      const bountiesPromises = data.response
        .filter((bounty: Bounty) => bounty.state !== null)
        .map(async (bounty: Bounty) => {
          let submissionsCount = 0;
          const submissionsCountRequest = await api.get(`/submissions/count?bounty=${bounty.id}`);
          if (submissionsCountRequest.success) {
            submissionsCount = submissionsCountRequest.response;
          }
          return {
            ...bounty,
            submissionsCount,
            active: bounty.state?.id === 1,
          };
        });
      setAllBounties(await Promise.all(bountiesPromises));
    };
    getBounties();
  }, []);

  return (
    <div className="bounties">
      <div className="bounties-content">
        <Title
          title="Taraxa ecosystem bounties"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />
        <PinnedBounties allBounties={allBounties} />
        <BountyList allBounties={allBounties} />
      </div>
    </div>
  );
}

function Card(bounty: Bounty) {
  const now = new Date().getTime();
  const endTime = new Date(bounty.end_date).getTime();
  const timeAgo = formatTime(Math.ceil((endTime - now) / 1000));
  return (
    <RewardCard
      key={bounty.id}
      title={bounty.name}
      description={(<Markdown>{bounty.reward_text}</Markdown>)}
      onClickButton={() => console.log('reward')}
      onClickText="Learn more"
      reward={bounty.reward}
      submissions={bounty.submissionsCount}
      expiration={now > endTime ? 'Expired' : timeAgo}
      SubmissionIcon={SubmissionIcon}
      ExpirationIcon={ExpirationIcon}
    />
  );
}

function PinnedBounties({ allBounties }: { allBounties: Bounty[] }) {
  const pinnedBounties = allBounties.filter((bounty: Bounty) => {
    return bounty.active && bounty.is_pinned;
  });

  if (pinnedBounties.length === 0) {
    return null;
  }

  const bounties = pinnedBounties.map((bounty) => Card(bounty));

  return (
    <>
      <div className="list-header">
        <div className="legend">
          <PinnedIcon />
          <Text label="Pinned" variant="body1" color="primary" className="icon-title" />
        </div>
      </div>
      <div className="cardContainer pinned">
        {bounties}
      </div>
    </>
  );
}

function BountyList({ allBounties }: { allBounties: Bounty[] }) {
  const [inactive, setInactive] = useState(false);

  const toggleInactive = () => {
    setInactive(i => !i);
  };

  const bounties = allBounties.filter((bounty: Bounty) => {
    if (inactive) {
      return !bounty.active && !bounty.is_pinned;
    }
    return bounty.active && !bounty.is_pinned;
  });

  const numRows = Array.apply(null, Array(Math.ceil(bounties.length / 3))).map((_, i) => i);

  return (
    <>
      <div className="list-header">
        <div className="legend">
          <span className={`dot ${inactive ? 'inactive' : 'active'}`}></span>
          <Text
            label={(inactive ? 'Inactive' : 'Active') + ` Bounties`}
            variant="body1"
            color="primary"
            className="icon-title"
          />
        </div>
        <Switch
          name="Show inactive"
          checked={inactive}
          label="Show inactive"
          onChange={toggleInactive}
        />
      </div>
      {numRows.map((row) => {
        const rows = bounties.slice(row * 3, row * 3 + 3).map((bounty) => Card(bounty));
        return <div key={row} className="cardContainer regular">{rows}</div>;
      })}
      {bounties.length === 0 && (
        <div>
          <Text
            label={`No ` + (inactive ? 'inactive' : 'active') + ` bounties`}
            variant="body2"
            color="textSecondary"
          />
        </div>
      )}
    </>
  );
}

export default Bounties;