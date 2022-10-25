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
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
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

const setTick = (tick: string) => ({
  responsive: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: false,
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
        display: false,
        drawBorder: false,
      },
      ticks: {
        stepSize: 50,
        color: theme.palette.text.secondary,
        callback: (value: any) => `${value}${tick}`,
      },
    },
  },
});

export interface BarChartProps {
  title?: string;
  labels: string[];
  tick?: string;
  datasets: ChartDataset<'bar', number[]>[];
}

const BarChart = ({
  title = '',
  labels = [],
  datasets,
  tick = '/s',
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.boxRoot}>
        <Box className={classes.innerBox}>
          <Bar options={setTick(tick)} data={parseData()} />
          <Box className={classes.titleHolder}>{title}</Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BarChart;
