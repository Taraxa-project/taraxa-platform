import React from 'react';
import { CssBaseline, ThemeProvider, Tooltip as MTooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import theme from '../theme';
import useStyles from './tooltip-styles';
import Text from '../Text';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#40465F',
    color: 'white',
    minWidth: 400,
    fontSize: theme.typography.pxToRem(10),
  },
}))(MTooltip);

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
      <HtmlTooltip
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
      </HtmlTooltip>
    </ThemeProvider>
  );
};

export default Tooltip;
