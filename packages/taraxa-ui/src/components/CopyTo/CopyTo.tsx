import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import theme from '../theme';
import { Clipboard } from '../Icons';
import Button from '../Button';

export interface CopyToProps {
  text: string;
  onCopy: () => any;
}

const CopyTo = ({ text, onCopy }: CopyToProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CopyToClipboard text={text} onCopy={onCopy}>
        <Button
          style={{ borderRadius: '8px' }}
          Icon={Clipboard}
          size='small'
          variant='contained'
          color='info'
        />
      </CopyToClipboard>
    </ThemeProvider>
  );
};

export default CopyTo;
