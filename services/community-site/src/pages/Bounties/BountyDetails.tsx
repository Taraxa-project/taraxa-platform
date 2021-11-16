import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { Text, Button, Pagination } from '@taraxa_project/taraxa-ui';

import UserIcon from './../../assets/icons/user';

import Title from '../../components/Title/Title';
import Markdown from '../../components/Markdown';

import { useApi } from '../../services/useApi';
import { formatTime } from '../../utils/time';

import { Bounty, Submission } from './bounty';
import BountyCard from './BoutyCard';

import './bounties.scss';

function BountyDetails() {
  let { id } = useParams<{ id: string }>();

  const { get } = useApi();
  const history = useHistory();

  const [bounty, setBounty] = useState<Partial<Bounty>>({});
  const [locale, setLocale] = useState('en');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);

  const perPage = 5;

  useEffect(() => {
    const getBounty = async (id: string) => {
      const data = await get(`/bounties/${id}`);
      if (!data.success) {
        return;
      }
      const bounty: Bounty = {
        ...data.response,
        submissionsCount: 0,
        active: data.response.state?.id === 1,
      };

      if (bounty.localizations.length > 0) {
        bounty.localizations = await Promise.all(bounty.localizations.map(async locale => {
          const data = await get(`/bounties/${locale.id}`);
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
  }, [get, id]);

  useEffect(() => {
    const getSubmissions = async (id: number) => {
      const data = await get(`/submissions?bounty=${id}&_sort=created_at:DESC`);
      if (!data.success) {
        return;
      }
      setSubmissions(data.response);
      setBounty(bounty => ({ ...bounty, submissionsCount: data.response.length }))
    };
    if (bounty.id) {
      getSubmissions(bounty.id);
    }
  }, [get, bounty?.id]);

  let submissionsTable;
  const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;
  if (submissionNeeded) {
    const now = new Date().getTime();
    const totalPages = Math.ceil(submissions.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const rows = submissions!.slice(start, end).map((submission: Submission) => (<div className="submission-row" key={submission.id}>
      <div className="submission-row-username">
        <div className="submission-row-username-icon">
          <UserIcon />
        </div>

        <Text
          variant="body2"
          label={(submission.user || {}).username || '-'}
        />
      </div>
      <div className="submission-row-content">
        <Text
          variant="body2"
          label={submission.hashed_content || '-'}
        />
      </div>
      <div className="submission-row-date">
        <Text
          variant="body2"
          label={`${formatTime(Math.ceil((now - new Date(submission.created_at).getTime()) / 1000))} ago`}
        />
      </div>
    </div>));

    if (rows.length > 0) {
      submissionsTable = (
        <div className="submission-table">
          <div className="submission-table-header">
            <Text
              variant="h5"
              color="primary"
            >
              SUBMISSIONS ({submissions.length})
            </Text>
            <Pagination
              page={page}
              totalPages={totalPages}
              prev={() => {
                setPage(page - 1);
              }}
              next={() => {
                setPage(page + 1);
              }}
            />
          </div>
          {rows}
        </div>
      );
    }
  }

  const localeNames: { [key: string]: string } = {
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
        <BountyCard
          bounty={bounty}
          isDetailed={true}
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
                    disabled={locale === "en"}
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
              {rewardText && rewardText.trim() !== '' && (
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
          goTo={(url) => history.push(url)}
          submissions={submissionsTable}
        />
      </div>
    </div>
  );
}

export default BountyDetails;