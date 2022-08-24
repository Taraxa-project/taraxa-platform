import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardActions,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useMediaQuery } from 'react-responsive';
import theme from '../theme';
import Button from '../Button';
import useStyles from './DataCard.styles';

export interface DataCardProps extends MCardProps {
  description: string;
  label?: string;
  input?: JSX.Element;
  disabled?: boolean;
  onClickButton?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onClickText?: string;
  descriptionLegend?: string;
  dataOptions?: JSX.Element;
  tooltip?: JSX.Element;
}

const DataCard = ({
  title,
  description,
  onClickButton,
  onClickText,
  input,
  disabled,
  label,
  dataOptions,
  tooltip,
  descriptionLegend,
}: DataCardProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard
        className={isMobile ? classes.mobileRoot : classes.root}
        elevation={0}
        variant="outlined"
      >
        <CardContent>
          {tooltip && <div className={classes.tooltipIcon}>{tooltip}</div>}
          <Typography variant="body1" className={classes.label} color="primary">
            {description}
          </Typography>

          <Typography color="primary" variant="h4" component="h4" className={classes.title}>
            {title}
          </Typography>
          {label && (
            <Typography className={classes.label} variant="body2" color="textSecondary">
              {label}
            </Typography>
          )}
        </CardContent>
        {input && input}
        {descriptionLegend && <div className={classes.descriptionLegend}>{descriptionLegend}</div>}
        {dataOptions && <div className={classes.chips}>{dataOptions}</div>}
        {onClickButton && onClickText && (
          <CardActions className={classes.actions}>
            <Button
              disableElevation
              color="secondary"
              disabled={disabled}
              onClick={onClickButton}
              variant="contained"
              label={onClickText}
              size="medium"
            />
          </CardActions>
        )}
      </MCard>
    </ThemeProvider>
  );
};

export default DataCard;
