import { useState, useRef } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from '../theme';

import { Attachment } from '../Icons';
import Button from '../Button';
import useStyles from './file-styles';

export interface FileProps {
  label: string;
  onChange: (file: File) => void;
}

const File = ({ onChange }: FileProps) => {
  const [filename, setFilename] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const classes = useStyles();

  const onChangeField = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }
    const file = e.target.files[0];
    setFilename(file?.name);
    onChange(file);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <input
        className={classes.input}
        ref={uploadRef}
        accept="*"
        onChange={onChangeField}
        type="file"
      />
      <Button
        className={classes.button}
        color="primary"
        variant="text"
        startIcon={<Attachment />}
        label={filename || `Attach file`}
        onClick={() => uploadRef.current?.click()}
        fullWidth
      />
    </ThemeProvider>
  );
};

export default File;
