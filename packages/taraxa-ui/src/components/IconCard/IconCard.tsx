import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardActions,
  CardContent,
  CssBaseline,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import theme from '../theme';
import Button from '../Button';
import useStyles from './iconcard-styles';

export interface IconCardProps extends MCardProps {
  description: string;
  onClickButton?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onClickText?: string;
  disabled?: boolean;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  tooltip?: JSX.Element;
}

const IconCard = ({
  title,
  description,
  onClickButton,
  onClickText,
  disabled,
  Icon,
  id,
  tooltip,
}: IconCardProps) => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MCard className={classes.root} id={id} elevation={0} variant="outlined">
        <CardContent className={classes.content}>
          {tooltip && Icon ? (
            <div className={classes.tooltipIcon}>{tooltip}</div>
          ) : (
            <div className={classes.noIconTooltipIcon}>{tooltip}</div>
          )}
          {Icon && (
            <div className={classes.icon}>
              <Icon />
            </div>
          )}
          <Typography color="primary" variant="h5" component="h5" className={classes.bottomSpacing}>
            {title}
          </Typography>
          <Typography className={classes.label} variant="body1" color="primary">
            <span>{description}</span>
          </Typography>
        </CardContent>
        {onClickButton && onClickText && (
          <CardActions className={classes.actions}>
            <Button
              disableElevation
              color="secondary"
              onClick={onClickButton}
              variant="contained"
              label={onClickText}
              disabled={disabled}
            ></Button>
          </CardActions>
        )}
      </MCard>
    </ThemeProvider>
  );
};

export default IconCard;
