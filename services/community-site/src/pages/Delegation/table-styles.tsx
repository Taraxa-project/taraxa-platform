import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 750,
    color: '#FFFFFF',
  },
  tableHeadRow: {
    borderBottom: '1px solid #40465F',
  },
  tableHeadCell: {
    color: '#878CA4',
    backgroundColor: '#1B1E2B',
    border: 'none',
    height: 'auto',
    lineHeight: '8px',
  },
  tableRow: {
    borderBottom: '1px solid #1E2231',
  },
  tableCell: {
    color: '#FFFFFF',
    border: 'none',
    height: 'auto',
  },
});

export default useStyles;
