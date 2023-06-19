import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Clipboard } from '../Icons';
import Button from '../Button';

export interface CopyToProps {
  text: string;
  onCopy: () => any;
}

const CopyTo = ({ text, onCopy }: CopyToProps) => {
  return (
    <CopyToClipboard text={text} onCopy={onCopy}>
      <Button
        style={{ borderRadius: '8px' }}
        Icon={Clipboard}
        size='small'
        variant='contained'
        color='info'
      />
    </CopyToClipboard>
  );
};

export default CopyTo;
