import React from 'react';
import { CssBaseline, ThemeProvider, Tooltip as MTooltip } from '@mui/material';
import theme from '../theme';
import useStyles from './Tooltip.styles';
import Text from '../Text';

export interface TooltipProps {
  title: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  id?: string;
}

const Tooltip = ({ title, Icon, className, id }: TooltipProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MTooltip
        className={className}
        id={id}
        title={
          <div className={classes.tooltip}>
            <Text label={title} variant="body1" color="primary" />
          </div>
        }
        enterTouchDelay={100}
      >
        <span>
          <Icon />
        </span>
      </MTooltip>
    </ThemeProvider>
  );
};

export default Tooltip;
