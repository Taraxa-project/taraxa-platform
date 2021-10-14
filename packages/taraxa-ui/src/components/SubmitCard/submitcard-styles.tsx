import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 400,
    minHeight: 470,
    textAlign: "center",
    backgroundColor: '#212534',
    paddingLeft: "2%",
    paddingRight: "1%",
    border: "1px solid #737B99",
    marginBottom: '5%',
  },
  mobileRoot: {
    width: '95%',
    textAlign: "center",
    backgroundColor: '#212534',
    paddingLeft: "2%",
    paddingRight: "1%",
    border: "1px solid #737B99",
    marginBottom: '5%',
  },
  content: {
    display: 'grid',
    height: '100%',
  },
  informationCard: {
    textAlign: 'left',
    marginBottom: '5%',
  },
  infoData: {
    margin: '1% 0 6% 0',
  },
  bottomContent: {
    margin: '5% 0 3% 0',
  },
  actionCard: {
    alignSelf: 'end',
    marginTop: '10%'
  },
  label: {
    fontSize: 12,
    marginTop: "5%",
    marginBottom: "5%"
  },
  rewardContent: {
    color: 'white',
    border: '1px solid #15AC5B',
    padding: '3% 5%',
    width: '93%',
  },
  actions: {
    display: "grid",
    marginBottom: "5%"
  },
  bottomSpacing: {
    marginBottom: '5%'
  },
  icon: {
    marginBottom: '5%',
    marginTop: '5%'
  },
  button: {
    marginTop: '3%',
    height: '2.625rem',
    fontSize: '1rem',
  },
  uploadButton: {
    color: '#878CA4',
    fontSize: '1rem'
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
    marginLeft: '5%',
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
    marginTop: '5%'
  },
});

export default useStyles;