import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset,
} from 'chart.js';
import { Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import useStyles from './BarChart.styles';
import theme from '../theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const setTick = (
  tick: string,
  withGrid = false,
  withTooltip = false,
  stepSize?: number
) => ({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: withTooltip,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        borderColor: theme.palette.grey.A100,
        borderWidth: 2,
      },
      ticks: {
        color: theme.palette.text.secondary,
      },
    },
    y: {
      grid: {
        display: withGrid,
        drawBorder: false,
      },
      ticks: {
        stepSize: stepSize || 50,
        color: theme.palette.text.secondary,
        callback: (value: any) => `${value}${tick}`,
      },
    },
  },
});

export interface BarChartProps {
  datasets: ChartDataset<'bar', number[]>[];
  labels: string[];
  title?: string;
  tick?: string;
  bright?: boolean;
  withGrid?: boolean;
  withTooltip?: boolean;
  stepSize?: number;
}

const BarChart = ({
  datasets,
  title = '',
  labels = [],
  tick = '/s',
  bright = false,
  withGrid = false,
  withTooltip = false,
  stepSize = 50,
}: BarChartProps) => {
  const classes = useStyles();
  const parseData = () => {
    const result = {
      labels,
      datasets,
    };
    return result;
  };

  return (
    <Box className={bright ? classes.boxRootBright : classes.boxRoot}>
      <Box className={classes.innerBox}>
        <Bar
          options={setTick(tick, withGrid, withTooltip, stepSize)}
          data={parseData()}
        />
        <Box className={classes.titleHolder}>{title}</Box>
      </Box>
    </Box>
  );
};

export default BarChart;
