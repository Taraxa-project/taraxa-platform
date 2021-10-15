import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
    minHeight: 180,
    textAlign: 'center',
    backgroundColor: '#212534',
    paddingLeft: '2%',
    paddingRight: '1%',
    border: '1px solid #737B99',
    marginBottom: '5%',
  },
  content: {
    gridTemplateColumns: '65% 35%',
    display: 'grid',
  },
  informationCard: {
    textAlign: 'left',
    gridColumn: 1,
  },
  infoData: {
    margin: '1% 0 6% 0',
  },
  bottomContent: {
    display: 'flex',
    margin: '3% 0 1% 0',
  },
  actionCard: {
    gridColumn: 2,
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
  rewardContent: {
    color: 'white',
    border: '1px solid #15AC5B',
    padding: '12px 0',
    width: '265px',
    height: '52px',
    margin: '0 auto',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '18px',
  },
  actions: {
    display: 'grid',
    marginBottom: '5%',
  },
  bottomSpacing: {
    marginBottom: '5%',
  },
  icon: {
    marginBottom: '5%',
    marginTop: '5%',
  },
  button: {
    marginTop: '20px',
    width: '265px',
    borderRadius: '4px',
    height: '52px',
  },
  iconContent: {
    marginRight: '5%',
    display: 'flex',
    width: '25%',
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
