import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 315,
    minHeight: 350,
    textAlign: 'center',
    backgroundColor: '#212534',
    padding: '24px',
    border: '1px solid #737B99',
    marginBottom: '24px',
  },
  mobileRoot: {
    width: '95%',
    textAlign: 'center',
    backgroundColor: '#212534',
    paddingLeft: '2%',
    paddingRight: '1%',
    border: '1px solid #737B99',
    marginBottom: '5%',
  },
  content: {
    display: 'grid',
    height: '100%',
    overflow: 'auto',
  },
  informationCard: {
    textAlign: 'center',
  },
  infoData: {
    margin: '0 0 16px',
    textAlign: 'left',
  },
  actionInfoData: {
    textAlign: 'center',
  }
  bottomContent: {
    margin: '5% 0 3% 0',
  },
  actionCard: {
    alignSelf: 'end',
  },
  label: {
    fontSize: 12,
    marginTop: '5%',
    marginBottom: '5%',
  },
  rewardContent: {
    color: 'white',
    width: '100%',
    border: '1px solid #15AC5B',
    height: '52px',
    margin: '0 auto',
    padding: '12px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '4px',
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
    marginTop: '18px',
    width: '100%',
  },
  iconContent: {
    marginBottom: '5%',
    display: 'flex',
  },
  dot: {
    height: '15px',
    width: '15px',
    backgroundColor: '#15AC5B',
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: '40%',
    marginTop: '10%',
    float: 'right',
  },
  mobileDot: {
    height: '15px',
    width: '15px',
    backgroundColor: '#15AC5B',
    borderRadius: '50%',
    display: 'inline-block',
    float: 'right',
    marginRight: '10%',
  },
  dataListContainer: {
    width: '85%',
    gridColumn: '1 / span 2',
    marginTop: '5%',
  },
});

export default useStyles;
