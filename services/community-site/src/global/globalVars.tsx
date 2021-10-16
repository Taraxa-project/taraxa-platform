import { Text } from '@taraxa_project/taraxa-ui';
import AttachmentIcon from '../assets/icons/attachment';
import SubmitIcon from '../assets/icons/submit';
import './globalVars.scss';

export const bountiesDescription = (
  <div className="bounties-description-container">
    <SubmitIcon /> <Text className="bounties-description" label="Submit bounty" color="primary" />
  </div>
);

export const fileButtonLabel = (
  <div className="file-button-label">
    <AttachmentIcon /> <Text className="file-input" label="Attach the file" color="primary" />
  </div>
);
