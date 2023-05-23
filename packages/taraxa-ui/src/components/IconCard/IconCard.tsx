import React from 'react';
import {
  Card as MCard,
  CardProps as MCardProps,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import Button from '../Button';
import useStyles from './IconCard.styles';

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
    <MCard className={classes.root} id={id} elevation={0} variant='outlined'>
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
        <Typography
          color='primary'
          variant='h5'
          component='h5'
          className={classes.bottomSpacing}
        >
          {title}
        </Typography>
        <Typography
          className={classes.label}
          color='primary'
          fontSize='14px'
          my={2}
        >
          {description}
        </Typography>
      </CardContent>
      {onClickButton && onClickText && (
        <CardActions className={classes.actions}>
          <Button
            disableElevation
            color='secondary'
            onClick={onClickButton}
            variant='contained'
            label={onClickText}
            disabled={disabled}
            fullWidth
          />
        </CardActions>
      )}
    </MCard>
  );
};

export default IconCard;
