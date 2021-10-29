import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
    minHeight: 180,
    textAlign: 'center',
    backgroundColor: '#282C3E',
    padding: '20px',
    border: '1px solid #6A7085',
  },
  content: {
    display: 'block',
    padding: 0,
    paddingBottom: '0 !important',
  },
  main: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  informationCard: {
    flex: 1,
    textAlign: 'left',
  },
  actionCard: {
    width: '263px'
  },
  title: {
    fontWeight: 700,
    marginBottom: '16px'
  },
  rewardContent: {
    color: 'white',
    border: '1px solid #15AC5B',
    padding: '16px 32px',
    margin: '16px 0',
    fontWeight: 700
  },
  iconContainer: {
    display: 'flex',
  },
  iconContent: {
    display: 'flex',
  },
  dataListContainer: {
    width: '100%',
    gridColumn: '1 / span 2',
    marginTop: '5%',
  },
  label: {
    fontSize: 12,
    marginTop: '5%',
    marginBottom: '5%',
  },

  actions: {
    display: 'grid',
    marginBottom: '5%',
  },
  icon: {
    marginBottom: '5%',
    marginTop: '5%',
  },
  dot: {
    height: '15px',
    width: '15px',
    backgroundColor: '#15AC5B',
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: '2%',
  },
});

export default useStyles;
