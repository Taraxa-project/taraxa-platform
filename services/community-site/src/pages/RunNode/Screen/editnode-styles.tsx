import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  editNodeAddressWrapper: {
    textAlign: 'left',
    color: '#15AC5B',
    fontSize: '16px',
  },
  editNodeAddress: {
    backgroundColor: '#282C3E',
    borderRadius: '4px',
    padding: '7px 10px',
  },
  commissionWrapper: {
    position: 'relative',
    marginTop: '50px',
  },
  commissionUpdate: {
    position: 'absolute',
    bottom: '10px',
    right: '90px',
  },
  commissionDisplay: {
    textAlign: 'left',
    paddingBottom: '5px',
    borderBottom: '1px solid #878CA4',
    display: 'block',
    width: '65%',
    marginLeft: '140px',
  },
  commissionDisplayPendingChange: {
    color: '#E96828',
    backgroundColor: '#3D2C2C',
    padding: '5px 10px',
    borderRadius: '8px',
  },
});

export default useStyles;
