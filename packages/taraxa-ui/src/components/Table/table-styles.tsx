import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: '5%',
    backgroundColor: '#151823 !important',
  },
  mobilePaper: {
    width: '100%',
    marginBottom: '5%',
    backgroundColor: '#151823 !important',
  },
  table: {
    minWidth: 750,
    color: '#FFFFFF',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  'MuiSvgIcon-root': {
    fill: 'white',
  },
  tableCell: {
    color: '#FFFFFF',
    border: 'none',
    height: 'auto',
  },
  mobileTableCell: {
    color: '#FFFFFF',
    border: 'none',
    paddingLeft: '1%',
    paddingRight: '1%',
    height: 'auto',
  },
  dateTableCell: {
    color: '#6A7085',
    border: 'none',
    height: 'auto',
  },
  mobileDateTableCell: {
    color: '#6A7085',
    border: 'none',
    paddingLeft: '1%',
    paddingRight: '1%',
  },
  tablePagination: {
    color: 'white',
  },
  tablePaginationCaption: {
    color: 'white',
  },
  tablePaginationSelectIcon: {
    color: 'white',
  },
  tablePaginationSelect: {
    color: 'white',
  },
  tablePaginationList: {
    color: 'white',
    backgroundColor: '#282C3E',
  },
  tablePaginationActions: {
    color: 'white',
  },
});

export default useStyles;
