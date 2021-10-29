import React from 'react';
import {
  Card as MCard,
  CardProps,
  CardContent,
  CssBaseline,
  Button as MButton,
  ThemeProvider,
  Typography,
  Input,
  TextField,
} from '@material-ui/core';
import theme from '../theme';
import Button from '../Button';
import useStyles from './submitcard-styles';

export interface SubmitCardProps extends CardProps {
  description?: JSX.Element;
  title: string;
  onClickText: string;
  onClickButton?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onInputChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onFileChange: (e: any) => void;
  fileButtonLabel: JSX.Element;
}

const SubmitCard = ({
  title,
  description,
  onClickButton,
  onClickText,
  onInputChange,
  onFileChange,
  fileButtonLabel,
}: SubmitCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} elevation={0} variant="outlined">
        <CardContent className={classes.content}>
          <div className={classes.informationCard}>
            <Typography variant="h5" color="primary" className={classes.infoData}>
              {title}
              <span className={classes.dot}></span>
            </Typography>

            <Typography variant="body2" color="primary" className={classes.infoData}>
              {description}
            </Typography>

            <div className={classes.bottomContent}>
              <TextField
                variant="filled"
                fullWidth
                multiline
                rows={6}
                placeholder="Submission"
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className={classes.actionCard}>
            <input
              accept="*"
              onChange={onFileChange}
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
            />
            <label htmlFor="raised-button-file">
              <MButton
                disableElevation
                fullWidth
                className={classes.uploadButton}
                color="primary"
                component="span"
              >
                {fileButtonLabel}
              </MButton>
            </label>
            <Button
              fullWidth
              disableElevation
              color="secondary"
              onClick={onClickButton}
              variant="contained"
              label={onClickText}
              size="medium"
              className={classes.button}
            ></Button>
          </div>
        </CardContent>
      </MCard>
    </ThemeProvider>
  );
};

export default SubmitCard;
