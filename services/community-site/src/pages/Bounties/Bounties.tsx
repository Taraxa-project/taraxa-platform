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
        <RewardCard
          title="Incentivized testnet"
          description={'Earn rewards for participating in running testnet nodes'}
          onClickText={detailsPage ? 'Submit' : 'Learn More'}
          reward={'100,000 TARA / month'}
          submissions={0}
          expiration={'Never expires'}
          SubmissionIcon={SubmissionIcon}
          ExpirationIcon={ExpirationIcon}
          // dataList={detailsPage ? list : undefined}
        />
        {submitPage ? (
          <SubmitCard
            title="Incentivized testnet"
            description={bountiesDescription}
            onClickText="Submit bounty"
            fileButtonLabel={fileButtonLabel}
            onClickButton={() => console.log('submited')}
            onFileChange={(e) => setFile(e.target.files[0])}
            onInputChange={(e) => setSubmitEmail(e.target.value)}
          />
        ) : (
          pinnedBounties.length && (
            <>
              <div
                className={
                  isMobile
                    ? 'mobile-icon-title-container'
                    : 'icon-title-container'
                }
              >
                <PinnedIcon />{' '}
                <Text
                  label="Pinned"
                  variant="body1"
                  color="primary"
                  className="icon-title"
                />
              </div>

              {pinnedBounties.map((pinnedBounty) => {
                let list = undefined

                if (pinnedBounty.submissions!.length > 0) {
                  const rows = pinnedBounty.submissions!.map((submission) => ({
                    Icon: UserIcon,
                    data: [
                      {
                        username: submission.user.username,
                        wallet: submission.hashed_content,
                        date: new Date(submission.created_at),
                      },
                    ],
                  }))
                  const mobileRows = pinnedBounty.submissions!.map(
                    (submission) => ({
                      Icon: UserIcon,
                      data: [
                        {
                          username: submission.user.username,
                          date: new Date(submission.created_at),
                          wallet: submission.hashed_content,
                        },
                      ],
                    })
                  )

                  list = (
                    <Table
                      columns={columns}
                      rows={isMobile ? mobileRows : rows}
                    />
                  )
                }
                return (
                  <div className="cardContainer">
                    {isMobile ? (
                      <VerticalRewardCard
                        title={pinnedBounty.name}
                        description={pinnedBounty.description}
                        onClickButton={() => console.log('reward')}
                        onClickText="Learn more"
                        reward={pinnedBounty.reward}
                        submissions={pinnedBounty.submissionsCount}
                        expiration={new Date(
                          pinnedBounty.end_date
                        ).toLocaleDateString()}
                        SubmissionIcon={SubmissionIcon}
                        ExpirationIcon={ExpirationIcon}
                      />
                    ) : (
                      <RewardCard
                        title={pinnedBounty.name}
                        description={pinnedBounty.description}
                        onClickButton={() =>
                          detailsPage
                            ? setSubmitPage(true)
                            : setDetailsPage(true)
                        }
                        onClickText={detailsPage ? 'Submit' : 'Learn More'}
                        reward={pinnedBounty.reward}
                        submissions={pinnedBounty.submissionsCount}
                        expiration={new Date(
                          pinnedBounty.end_date
                        ).toLocaleDateString()}
                        SubmissionIcon={SubmissionIcon}
                        ExpirationIcon={ExpirationIcon}
                        dataList={detailsPage ? list : undefined}
                      />
                    )}
                  </div>
                )
              })}

              <div
                className={
                  isMobile
                    ? 'mobile-icon-title-container'
                    : 'icon-title-container'
                }
              >
                <span className="dot inactive" />{' '}
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
              {numRows.map((row) => {
                const rows = bounties
                  .slice(row * 3, row * 3 + 3)
                  .map((bounty) => {
                    const endDate = new Date(
                      bounty.end_date
                    ).toLocaleDateString()
                    return (
                      <VerticalRewardCard
                        active
                        key={bounty.id}
                        title={bounty.name}
                        description={bounty.description}
                        onClick={() => console.log('reward')}
                        onClickText="Learn more"
                        reward={bounty.reward}
                        submissions={bounty.submissionsCount}
                        expiration={endDate}
                        SubmissionIcon={SubmissionIcon}
                        ExpirationIcon={ExpirationIcon}
                      />
                    )
                  })
                return <div className="cardContainer">{rows}</div>
              })}
              {bounties.length === 0 && (
                <div>
                  <Text
                    label={
                      `No ` + (inactive ? 'inactive' : 'active') + ` bounties`
                    }
                    variant="body2"
                    color="textSecondary"
                  />
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}

export default Bounties
