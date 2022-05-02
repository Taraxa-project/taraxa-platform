import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { Text, Button, Pagination } from '@taraxa_project/taraxa-ui';

import UserIcon from '../../assets/icons/user';

import Title from '../../components/Title/Title';
import Markdown from '../../components/Markdown';

import useApi from '../../services/useApi';
import useBounties from '../../services/useBounties';
import { formatTime } from '../../utils/time';

import { Bounty, Submission } from './bounty';
import BountyCard from './BountyCard';

import './bounties.scss';

function BountyDetails() {
  const { id } = useParams<{ id: string }>();

  const { get } = useApi();
  const history = useHistory();

  const { getBountyUserSubmissionsCount } = useBounties();
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

      const userSubmissionsCount = await getBountyUserSubmissionsCount(id);

      let submissionsCount = 0;
      const submissionsCountRequest = await get(`/submissions/count?bounty=${id}`);
      if (submissionsCountRequest.success) {
        submissionsCount = submissionsCountRequest.response;
      }

      const bounty: Bounty = {
        ...data.response,
        submissionsCount,
        userSubmissionsCount,
        active: data.response.state?.id === 1,
      };

      if (bounty.localizations.length > 0) {
        bounty.localizations = await Promise.all(
          bounty.localizations.map(async (locale) => {
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
            };
          }),
        );
      }
      setBounty(bounty);
    };
    getBounty(id);
  }, [get, id, getBountyUserSubmissionsCount]);

  const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;

  useEffect(() => {
    const getSubmissions = async (id: number) => {
      const data = await get(`/submissions?bounty=${id}&_limit=-1&_sort=created_at:DESC`);
      if (!data.success) {
        return;
      }
      setSubmissions(data.response);
    };
    if (bounty.id && submissionNeeded) {
      getSubmissions(bounty.id);
    }
  }, [get, bounty?.id, submissionNeeded]);

  let submissionsTable;
  if (submissionNeeded) {
    const now = new Date().getTime();
    const totalPages = Math.ceil(submissions.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const rows = submissions!.slice(start, end).map((submission: Submission) => (
      <div className="submission-row" key={submission.id}>
        <div className="submission-row-username">
          <div className="submission-row-username-icon">
            <UserIcon />
          </div>

          <Text variant="body2" label={(submission.user || {}).username || '-'} />
        </div>
        <div className="submission-row-content">
          <Text className="wide-hash" variant="body2" label={submission.hashed_content || '-'} />
          <Text
            title={submission.hashed_content || '-'}
            variant="body2"
            label={
              submission.hashed_content
                ? `${submission?.hashed_content?.slice(0, 8)}...${submission?.hashed_content?.slice(
                    -5,
                  )}`
                : '-'
            }
          />
        </div>
        <div className="submission-row-date">
          <Text
            variant="body2"
            label={`${formatTime(
              Math.ceil((now - new Date(submission.created_at).getTime()) / 1000),
            )} ago`}
          />
        </div>
      </div>
    ));

    if (rows.length > 0) {
      submissionsTable = (
        <div className="submission-table">
          <div className="submission-table-header">
            <Text variant="h5" color="primary">
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
    en: 'EN',
    'ru-RU': 'RU',
    'zh-CN': 'CN',
  };

  if (!bounty) {
    return null;
  }

  let description = bounty.description || '';
  let rewardText = bounty.reward_text || '';

  if (locale !== 'en') {
    const bt = bounty.localizations!.find((b) => b.locale === locale);
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
          bounty={bounty as Bounty}
          isDetailed
          description={
            <>
              {bounty.localizations && bounty.localizations!.length > 0 && (
                <div className="locale">
                  <Button
                    disableElevation
                    color="primary"
                    variant="outlined"
                    label="EN"
                    onClick={() => setLocale('en')}
                    size="small"
                    disabled={locale === 'en'}
                  />
                  {bounty.localizations!.map((l) => (
                    <Button
                      key={l.id}
                      disableElevation
                      color="primary"
                      variant="outlined"
                      label={localeNames[l.locale]}
                      onClick={() => setLocale(l.locale)}
                      size="small"
                      disabled={l.locale === locale}
                    />
                  ))}
                </div>
              )}

              <Text variant="h5" color="primary">
                Description
              </Text>
              <Markdown>{description}</Markdown>
              {rewardText && rewardText.trim() !== '' && (
                <>
                  <Text variant="h5" color="primary">
                    Reward
                  </Text>
                  <Markdown>{rewardText}</Markdown>
                </>
              )}
            </>
          }
          goTo={(url) => history.push(url)}
          submissions={submissionsTable}
        />
      </div>
    </div>
  );
}

export default BountyDetails;
