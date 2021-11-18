import { useEffect, useState, useCallback } from 'react';
import stringify from 'qs-stringify';
import { Text, Switch, Pagination } from '@taraxa_project/taraxa-ui';
import { useHistory } from 'react-router-dom';

import PinnedIcon from '../../assets/icons/pinned';

import Title from '../../components/Title/Title';

import { useApi } from '../../services/useApi';

import { Bounty } from './bounty';
import BountyCard from './BoutyCard';
import './bounties.scss';

function Bounties() {
  const { get } = useApi();
  const history = useHistory();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [getPinnedBountiesSubmissions, setGetPinnedBountiesSubmissions] = useState(false);
  const [getBountiesSubmissions, setGetBountiesSubmissions] = useState(false);
  const [pinnedBounties, setPinnedBounties] = useState<Bounty[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [inactive, setInactive] = useState(false);

  const perPage = 6;

  const toggleInactive = () => {
    setInactive((i) => !i);
    setPage(1);
  };

  const goTo = (url: string) => {
    history.push(url);
  };

  const decorateBounties = useCallback((bounties: Bounty[]): Bounty[] => {
    return bounties.map((bounty: Bounty) => ({
      ...bounty,
      submissionsCount: 0,
      active: bounty.state?.id === 1,
    }));
  }, []);

  const getSubmissions = useCallback(
    async (bounties: Bounty[]): Promise<Bounty[]> => {
      const bountiesWithSubmissions = bounties.map(async (bounty: Bounty) => {
        let submissionsCount = 0;
        const submissionsCountRequest = await get(`/submissions/count?bounty=${bounty.id}`);
        if (submissionsCountRequest.success) {
          submissionsCount = submissionsCountRequest.response;
        }
        return {
          ...bounty,
          submissionsCount,
        };
      });

      return await Promise.all(bountiesWithSubmissions);
    },
    [get],
  );

  const getPinnedBounties = useCallback(async () => {
    const data = await get(`/bounties?state.id=1&is_pinned=1`);
    if (!data.success) {
      return;
    }
    setPinnedBounties(decorateBounties(data.response));
    setGetPinnedBountiesSubmissions(true);
  }, [get, decorateBounties]);

  const getBountiesFilter = useCallback(() => {
    const pinnedFilter = stringify({ _where: { _or: [{ is_pinned_null: 1 }, { is_pinned: 0 }] } });
    const stateFilter = inactive ? 'state.id=2' : 'state.id=1';
    return `${stateFilter}&${pinnedFilter}&_limit=${perPage}&_start=${(page - 1) * perPage}`;
  }, [inactive, page]);

  const getBounties = useCallback(async () => {
    const filter = getBountiesFilter();
    const bounties = await get(`/bounties?${filter}`);
    if (!bounties.success) {
      return;
    }
    setBounties(decorateBounties(bounties.response));
    setGetBountiesSubmissions((bs) => !bs);
  }, [get, getBountiesFilter, decorateBounties]);

  const getBountiesCount = useCallback(async () => {
    const filter = getBountiesFilter();
    const total = await get(`/bounties/count?${filter}`);
    if (!total.success) {
      return;
    }

    setTotal(total.response);
  }, [get, getBountiesFilter]);

  useEffect(() => {
    getPinnedBounties();
  }, [getPinnedBounties]);

  useEffect(() => {
    getBounties();
  }, [getBounties, inactive, page]);

  useEffect(() => {
    getBountiesCount();
  }, [getBountiesCount, inactive]);

  useEffect(() => {
    const addSubmissions = async () => {
      setPinnedBounties(await getSubmissions(pinnedBounties));
    };
    addSubmissions();
  }, [getSubmissions, getPinnedBountiesSubmissions]);

  useEffect(() => {
    const addSubmissions = async () => {
      setBounties(await getSubmissions(bounties));
    };
    addSubmissions();
  }, [getSubmissions, getBountiesSubmissions]);

  return (
    <div className="bounties">
      <div className="bounties-content">
        <Title
          title="Taraxa ecosystem bounties"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />
        <PinnedBounties bounties={pinnedBounties} goTo={goTo} />
        <div className="list-header">
          <div className="list-header-left">
            <div className="legend">
              <span className={`dot ${inactive ? 'inactive' : 'active'}`} />
              <Text
                label={`${inactive ? 'Inactive' : 'Active'} Bounties`}
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
          <Pagination
            page={page}
            totalPages={Math.ceil(total / perPage)}
            prev={() => {
              setPage(page - 1);
            }}
            next={() => {
              setPage(page + 1);
            }}
          />
        </div>
        {bounties.length === 0 && (
          <div>
            <Text
              label={`No ${inactive ? 'inactive' : 'active'} bounties`}
              variant="body2"
              color="textSecondary"
            />
          </div>
        )}
        {bounties.length > 0 && <BountyList bounties={bounties} goTo={goTo} />}
      </div>
    </div>
  );
}

function PinnedBounties({ bounties, goTo }: { bounties: Bounty[]; goTo: (url: string) => void }) {
  if (bounties.length === 0) {
    return null;
  }

  const pinnedBounties = bounties.map((bounty) => (
    <BountyCard key={bounty.id} bounty={bounty} goTo={goTo} />
  ));

  return (
    <>
      <div className="list-header">
        <div className="legend">
          <PinnedIcon />
          <Text label="Pinned" variant="body1" color="primary" className="icon-title" />
        </div>
      </div>
      <div className="cardContainer pinned">{pinnedBounties}</div>
    </>
  );
}

function BountyList({ bounties, goTo }: { bounties: Bounty[]; goTo: (url: string) => void }) {
  return (
    <>
      {Array.apply(null, Array(Math.ceil(bounties.length / 3)))
        .map((_, i) => i)
        .map((row) => {
          const rows = bounties
            .slice(row * 3, row * 3 + 3)
            .map((bounty) => <BountyCard key={bounty.id} bounty={bounty} goTo={goTo} />);
          return (
            <div key={row} className="cardContainer regular">
              {rows}
            </div>
          );
        })}
    </>
  );
}

export default Bounties;
