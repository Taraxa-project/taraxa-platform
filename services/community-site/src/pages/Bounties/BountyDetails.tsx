import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { RewardCard, Table, Text, Button } from '@taraxa_project/taraxa-ui';

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
  const history = useHistory();

  const [bounty, setBounty] = useState<Partial<Bounty>>({});
  const [locale, setLocale] = useState('en');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const getBounty = async (id: string) => {
      const data = await api.get(`/bounties/${id}`);
      if (!data.success) {
        return;
      }
      const bounty: Bounty = {
        ...data.response,
        active: data.response.state?.id === 1,
      };

      if (bounty.localizations.length > 0) {
        bounty.localizations = await Promise.all(bounty.localizations.map(async locale => {
          const data = await api.get(`/bounties/${locale.id}`);
          if (!data.success) {
            return locale;
          }
          const b: Bounty = data.response;
          const { description, submission, reward_text } = b;
          return {
            ...locale,
            description,
            submission,
            reward_text,
          }
        }));
      }
      setBounty(bounty);
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

  const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;

  const now = new Date().getTime();
  const endTime = new Date(bounty.end_date).getTime();
  const timeAgo = formatTime(Math.ceil((endTime - now) / 1000));

  let submissionsTable;

  if (submissionNeeded) {
    const columns = [
      { path: 'username', name: 'username' },
      { path: 'wallet', name: 'wallet' },
      { path: 'date', name: 'date' },
    ];

    const rows = submissions!.map((submission: Submission) => ({
      Icon: UserIcon,
      data: [
        {
          username: (submission.user || {}).username || '-',
          wallet: submission.hashed_content,
          date: new Date(submission.created_at),
        },
      ],
    }));

    submissionsTable = <Table columns={columns} rows={rows} />;
  }

  const localeNames = {
    "en": "EN",
    "ru-RU": "RU",
    "zh-CN": "CN",
  }

  if (!bounty) {
    return null;
  }

  let description = bounty.description || '';
  let rewardText = bounty.reward_text || '';

  if (locale !== 'en') {
    const bt = bounty.localizations!.find(b => b.locale === locale);
    if (bt) {
      description = bt.description;
      rewardText = bt.reward_text;
    }
  }

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
          description={(
            <>
              {bounty.localizations && bounty.localizations!.length > 0 && (
                <div className="locale">
                  <Button
                    disableElevation
                    color="primary"
                    variant="outlined"
                    label="EN"
                    onClick={() => setLocale("en")}
                    size="small"
                    disabled={locale == "en"}
                  ></Button>
                  {bounty.localizations!.map(l => (
                    <Button
                      key={l.id}
                      disableElevation
                      color="primary"
                      variant="outlined"
                      label={localeNames[l.locale]}
                      onClick={() => setLocale(l.locale)}
                      size="small"
                      disabled={l.locale === locale}
                    ></Button>
                  ))}
                </div>
              )}

              <Text
                variant="h5"
                color="primary"
              >
                Description
              </Text>
              <Markdown>{description}</Markdown>
              {bounty.reward_text?.trim() !== '' && (
                <>
                  <Text
                    variant="h5"
                    color="primary"
                  >
                    Reward
                  </Text>
                  <Markdown>{rewardText}</Markdown>
                </>
              )}
            </>
          )}
          onClickButton={submissionNeeded ? () => history.push(`/bounties/${bounty.id}/submit`) : undefined}
          onClickText={submissionNeeded ? "Submit" : "No submission necessary"}
          reward={bounty.reward}
          submissions={submissions.length}
          expiration={now > endTime ? 'Expired' : timeAgo}
          SubmissionIcon={SubmissionIcon}
          ExpirationIcon={ExpirationIcon}
          dataList={submissionsTable}
          active={bounty.active}
        />
      </div>
    </div>
  );
}

export default BountyDetails;