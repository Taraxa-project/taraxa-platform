import { useState } from 'react'
import { Button, Text, Checkbox } from '@taraxa_project/taraxa-ui'

import KYCIcon from '../../../assets/icons/kyc'

import { useApi } from '../../../services/useApi'

type KYCProps = {
  onSuccess: () => void
}

const KYC = ({ onSuccess }: KYCProps) => {
  const api = useApi()

  const [agreement, setAgreement] = useState(false)

  const agreementTrigger = (event: any) => {
    setAgreement(event.target.checked)
  }

  return (
    <div>
      <div className="kycTopContainer">
        <Text
          style={{ marginBottom: '2%' }}
          label="Submit KYC"
          variant="h6"
          color="primary"
        />
        <KYCIcon />
        <Text
          style={{ margin: '2% 0 2% 0' }}
          label="To continue please upload an image of your ID / passport"
          variant="body2"
          color="textSecondary"
        />
        <Text label="NOTICE:" color="primary" variant="body2" />
      </div>

      <ul className="decimalUL">
        <li>
          <Text
            label="To comply with recent SEC rulings, United States persons cannot receive token rewards"
            variant="body2"
            color="textSecondary"
          />
        </li>
        <li>
          <Text
            label="Please don’t try to exit verification process while uploading an image;"
            variant="body2"
            color="textSecondary"
          />
        </li>
        <li>
          <Text
            label="Only upload the image of the selected ID document;"
            variant="body2"
            color="textSecondary"
          />
        </li>
        <li>
          <Text
            label="Picture should not be modified in any way;"
            variant="body2"
            color="textSecondary"
          />
        </li>
        <li>
          <Text
            label="Ukranian passports are not supported."
            variant="body2"
            color="textSecondary"
          />
        </li>
      </ul>

      <div className="checkboxContainer">
        <Checkbox
          name="agreement"
          onChange={agreementTrigger}
          checked={agreement}
        />
        <Text
          label="I agree to the processing of my personal data"
          variant="body2"
          color="primary"
        />
      </div>

      <Button
        label="Proceed to verification"
        color="secondary"
        variant="contained"
        className="marginButton"
        disabled={!agreement}
        fullWidth
        onClick={async () => {
          const result = await api.post(`/users/kyc`, {}, true)
          if (result.success) {
            window.location.replace(result.response.kycLink)
            return
          }
          onSuccess()
        }}
      />
    </div>
  )
}

export default KYC
