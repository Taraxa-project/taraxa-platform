import { useState } from 'react'
import { BaseCard, DataCard, InputField, Chip } from '@taraxa_project/taraxa-ui'
import { useMediaQuery } from 'react-responsive'

import Title from '../../components/Title/Title'

import './redeem.scss'

function Redeem() {
  const [availableToclaim, setAvailableToclaim] = useState(0)
  const [totalToclaim, setTotalToclaim] = useState(0)
  const [claim, setClaim] = useState('')
  const [open, setOpen] = useState(true)
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` })

  const availableTrigger = (event: any) => {
    setAvailableToclaim(event.target.value)
  }
  const totalTrigger = (event: any) => {
    setTotalToclaim(event.target.value)
  }
  const claimTrigger = (claim: string) => {
    setClaim(claim)
  }
  const onClose = () => {
    setOpen(false)
  }
  const availableInput = (
    <InputField
      type="number"
      min={1}
      max={100000}
      className="whiteInput"
      label=""
      color="secondary"
      placeholder="Enter amount..."
      value={availableToclaim}
      variant="outlined"
      fullWidth
      onChange={availableTrigger}
      margin="normal"
    />
  )

  const claimchips = (
    <>
      <Chip
        label="25%"
        onClick={() => claimTrigger('25%')}
        variant="default"
        clickable
        className={claim === '25%' ? 'chipSelected' : 'chip'}
      />
      <Chip
        label="50%"
        onClick={() => claimTrigger('50%')}
        className={claim === '50%' ? 'chipSelected' : 'chip'}
        variant="default"
        clickable
      />
      <Chip
        label="75%"
        onClick={() => claimTrigger('75%')}
        variant="default"
        clickable
        className={claim === '75%' ? 'chipSelected' : 'chip'}
      />
      <Chip
        label="100%"
        onClick={() => claimTrigger('100%')}
        variant="default"
        clickable
        className={claim === '100%' ? 'chipSelected' : 'chip'}
      />
    </>
  )

  return (
    <div className={isMobile ? 'claim-mobile' : 'claim'}>
      <div className="claim-content">
        <Title
          title="Redeem TARA Points"
          subtitle="Earn rewards and help test &amp; secure the Taraxa’s network"
        />

        <div className="cardContainer">
          <BaseCard title="26,322" description="TARA locked till next month" />
          <BaseCard title="141,234" description="TARA claimed total" />
          <BaseCard title="41,234" description="Current wallet balance" />
        </div>
        <div className="cardContainer">
          <DataCard
            title="122,234,123"
            description="Available to claim"
            label="TARA"
            onClickButton={() => console.log('tara')}
            onClickText="Claim"
            input={availableInput}
            dataOptions={claimchips}
          />
        </div>
      </div>
    </div>
  )
}

export default Redeem
