import { useEffect, useState } from 'react'
import {
  Text,
  RewardCard,
  Switch,
  VerticalRewardCard,
  Table,
  SubmitCard,
} from '@taraxa_project/taraxa-ui'
import PinnedIcon from '../../assets/icons/pinned'
import SubmissionIcon from '../../assets/icons/submission'
import ExpirationIcon from '../../assets/icons/expiration'
import UserIcon from './../../assets/icons/user'
import { useMediaQuery } from 'react-responsive'
import { useApi } from '../../services/useApi'

import './bounties.scss'
import { bountiesDescription, fileButtonLabel } from '../../global/globalVars'

import Title from '../../components/Title/Title'

type BountyState = {
  id: number
}

type Submission = {
  user: any
  hashed_content: string
  created_at: Date
}

type Bounty = {
  id: number
  name: string
  description: string
  reward: string
  state: BountyState | null
  submissionsCount?: number
  submissions?: Submission[]
  end_date: Date
  active: boolean
  is_pinned: boolean
}

type BountyList = {
  items: Bounty[]
}

function Bounties() {
  const api = useApi()
  const [allBounties, setAllBounties] = useState<Bounty[]>([])
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` })
  const [inactive, setInactive] = useState(false)
  const [detailsPage, setDetailsPage] = useState(false)
  const [submitPage, setSubmitPage] = useState(false)
  const [submitEmail, setSubmitEmail] = useState('')
  const [file, setFile] = useState()

  useEffect(() => {
    const getBounties = async () => {
      const data = await api.get(`/bounties?_limit=-1`)
      if (!data.success) {
        return
      }
      const bountiesPromises = data.response
        .filter((bounty: Bounty) => bounty.state !== null)
        .map(async (bounty: Bounty) => {
          let submissionsCount = 0
          let submissions = []
          const submissionsCountRequest = await api.get(
            `/submissions/count?bounty=${bounty.id}`
          )
          if (submissionsCountRequest.success) {
            submissionsCount = submissionsCountRequest.response
          }
          if (bounty.is_pinned) {
            const submissionsRequest = await api.get(
              `/submissions?bounty=${bounty.id}`
            )
            if (submissionsRequest.success) {
              submissions = submissionsRequest.response
            }
          }
          return {
            ...bounty,
            active: bounty.state?.id === 1,
            submissions: submissions,
            submissionsCount: submissionsCount,
          }
        })
      setAllBounties(await Promise.all(bountiesPromises))
    }
    getBounties()
  }, [])

  const onChangeInactive = () => {
    setInactive(!inactive)
  }

  const bounties = allBounties.filter((bounty: Bounty) => {
    if (inactive) {
      return !bounty.active && !bounty.is_pinned
    }

    return bounty.active && !bounty.is_pinned
  })

  const pinnedBounties = allBounties.filter((bounty: Bounty) => {
    return bounty.active && bounty.is_pinned
  })

  const inactiveBounties = allBounties.filter((bounty: Bounty) => {
    return !bounty.active && !bounty.is_pinned
  })

  const BountyCardList = (list: BountyList) => {
    return (
      <div className="cardContainer bounty-card-list-container">
        {list.items.map((bounty) => {
          if (bounty.is_pinned && !isMobile) {
            return (
              <RewardCard
                title={bounty.name}
                description={bounty.description}
                onClickButton={() => console.log('reward')}
                onClickText="Learn more"
                reward={bounty.reward}
                submissions={bounty.submissionsCount}
                expiration={new Date(
                  bounty.end_date
                ).toLocaleDateString()}
                SubmissionIcon={SubmissionIcon}
                ExpirationIcon={ExpirationIcon}
                // dataList={detailsPage ? list : undefined}
              />
            )
          } else {
            return (
              <VerticalRewardCard
                title={bounty.name}
                description={bounty.description}
                onClickButton={() => console.log('reward')}
                onClickText="Learn more"
                reward={bounty.reward}
                submissions={bounty.submissionsCount}
                expiration={new Date(
                  bounty.end_date
                ).toLocaleDateString()}
                SubmissionIcon={SubmissionIcon}
                ExpirationIcon={ExpirationIcon}
              />
            )
          }
        })}
      </div>
    )
  }

  const columns = [
    { path: 'username', name: 'username' },
    { path: 'wallet', name: 'wallet' },
    { path: 'date', name: 'date' },
  ]

  const numRows = Array.apply(null, Array(Math.ceil(bounties.length / 3))).map(
    (_, i) => i
  )

  return (
    <div className={isMobile ? 'mobile-bounties' : 'bounties'}>
      <div className="bounties-content">
        <Title
          title="Taraxa ecosystem bounties"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />

        <div
          className={
            isMobile
              ? 'mobile-icon-title-container pinned-icon-container'
              : 'icon-title-container pinned-icon-container'
          }
        >
          <PinnedIcon />
          <Text
            label="Pinned"
            variant="body1"
            color="primary"
            className="icon-title"
          />
        </div>
        {pinnedBounties.length > 0 && (
          <BountyCardList items={pinnedBounties} />
        )}

        <div
          className={
            isMobile
              ? 'mobile-icon-title-container'
              : 'icon-title-container'
          }
        >
          <span className={inactive ? 'dot inactive' : 'dot active'} />
          <Text
            label={(inactive ? 'Inactive' : 'Active') + ` Bounties`}
            variant="body1"
            color="primary"
            className="icon-title"
          />
        </div>
        <Switch
          id="bountiesSwitch"
          name="Show inactive"
          value={inactive}
          label="Show inactive"
          onChange={() => onChangeInactive()}
        />

        {inactive ? (
          inactiveBounties.length > 0 && (
            <BountyCardList items={inactiveBounties} />
          )
        ) : (
          bounties.length > 0 && (
            <BountyCardList items={bounties} />
          )
        )}

      </div>
    </div>
  )
}

export default Bounties
