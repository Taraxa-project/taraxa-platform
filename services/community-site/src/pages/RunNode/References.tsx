import React from 'react';
import { Text, Button } from '@taraxa_project/taraxa-ui';

interface ReferencesProps {
  canRegisterValidator: boolean;
  openRegisterValidatorModal: () => void;
}

const References = ({ canRegisterValidator, openRegisterValidatorModal }: ReferencesProps) => {
  return (
    <div className="box">
      <Text label="References" variant="h6" color="primary" className="box-title" />
      <Button
        label="How do I install a node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/testnet_node_setup',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="Where do I find my address?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/node_address',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="How do I register my node?"
        className="referenceButton"
        variant="contained"
        onClick={() => openRegisterValidatorModal()}
        disabled={!canRegisterValidator}
      />
      <Button
        label="How do I upgrade my node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/upgrade-a-node/software-upgrade',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="How do I reset my node?"
        className="referenceButton"
        variant="contained"
        onClick={() =>
          window.open(
            'https://docs.taraxa.io/node-setup/upgrade-a-node/data-reset',
            '_blank',
            'noreferrer noopener',
          )
        }
      />
      <Button
        label="I need help!"
        className="referenceButton"
        variant="contained"
        onClick={() => window.open('https://taraxa.io/discord', '_blank', 'noreferrer noopener')}
      />
    </div>
  );
};

export default References;
