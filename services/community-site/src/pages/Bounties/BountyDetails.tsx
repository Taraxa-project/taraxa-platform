import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { RewardCard, Table } from '@taraxa_project/taraxa-ui';

import SubmissionIcon from '../../assets/icons/submission';
import ExpirationIcon from '../../assets/icons/expiration'
import UserIcon from './../../assets/icons/user';

import Title from '../../components/Title/Title';
import Markdown from '../../components/Markdown';

import { useApi } from '../../services/useApi';
import { formatTime } from '../../utils/time';

import { Bounty, Submission } from './bounty';

import './bounties.scss';

function BountyDetails() {
  let { id } = useParams<{ id: string }>();

  const api = useApi();
  const [bounty, setBounty] = useState<Partial<Bounty>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const getBounty = async (id: string) => {
      const data = await api.get(`/bounties/${id}`);
      if (!data.success) {
        return;
      }
      setBounty({
        ...data.response,
        active: data.response.state?.id === 1,
      });
    };
    getBounty(id);
  }, [id]);

  useEffect(() => {
    const getSubmissions = async (id: number) => {
      const data = await api.get(`/submissions?bounty=${id}`);
      if (!data.success) {
        return;
      }
      setSubmissions(data.response);
    };
    if (bounty.id) {
      getSubmissions(bounty.id);
    }
  }, [bounty]);

  const now = new Date().getTime();
  const endTime = new Date(bounty.end_date).getTime();
  const timeAgo = formatTime(Math.ceil((endTime - now) / 1000));

  const columns = [
    { path: 'username', name: 'username' },
    { path: 'wallet', name: 'wallet' },
    { path: 'date', name: 'date' },
  ];

  const rows = submissions!.map((submission: Submission) => ({
    Icon: UserIcon,
    data: [
      {
        username: submission.user.username,
        wallet: submission.hashed_content,
        date: new Date(submission.created_at),
      },
    ],
  }));

  const submissionsTable = <Table columns={columns} rows={rows} />;

  return (
    <div className="bounties">
      <div className="bounties-content">
        <Title
          title="Taraxa ecosystem bounties"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />
        <RewardCard
          key={bounty.id}
          title={bounty.name}
          description={(<Markdown>{bounty.description}</Markdown>)}
          onClickButton={() => console.log('reward')}
          onClickText="Submit"
          reward={bounty.reward}
          submissions={submissions.length}
          expiration={now > endTime ? 'Expired' : timeAgo}
          SubmissionIcon={SubmissionIcon}
          ExpirationIcon={ExpirationIcon}
          dataList={submissionsTable}
        />
      </div>
    </div>
  );
}

export default BountyDetails;