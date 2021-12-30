import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  nodeDescriptor: {
    textAlign: 'center',
  },
  nodeDescriptorSuccess: {
    margin: '20px 0 40px 0',
  },
  nodeName: {
    fontWeight: 'bold',
    fontSize: '17px',
    margin: '2px 0',
  },
  nodeAddressWrapper: {
    color: '#15AC5B',
  },
  nodeAddress: {
    backgroundColor: '#31364B',
    borderRadius: '4px',
    padding: '7px 10px',
  },
  taraContainer: {
    float: 'left',
    width: '50%',
  },
  taraContainerAmountDescription: {
    textAlign: 'left',
    fontSize: '12px',
    marginTop: 0,
  },
  taraContainerBalance: {
    marginRight: '10px',
  },
  taraContainerWrapper: {
    padding: '0px 10px',
    overflow: 'auto',
  },
  taraContainerAmount: {
    textAlign: 'left',
    backgroundColor: '#31364B',
    border: '1px solid #4F5368',
    borderRadius: '4px',
  },
  taraContainerAmountTotal: {
    margin: '10px 0 0 10px',
    fontSize: '22px',
    fontWeight: 700,
  },
  taraContainerUnit: {
    margin: '5px 0 10px 10px',
    color: '#878CA4',
    textAlign: 'left',
    fontSize: '12px',
  },
  taraInputWrapper: {
    maxWidth: '95%',
    padding: '10px',
    border: '1px solid #15AC5B',
    borderRadius: '6px',
    marginTop: '10px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  maxDelegatableDescription: {
    margin: '2px 0',
  },
  maxDelegatableTotal: {
    fontWeight: 'bold',
    fontSize: '36px',
    margin: '2px 0',
  },
  maxDelegatableUnit: {
    fontSize: '16px',
    color: '#878CA4',
    margin: '0',
  },
  delegatePercentWrapper: {
    margin: '0 0 2px 0',
  },
  delegatePercent: {
    color: '#FFF',
    background: '#40465F',
    borderRadius: '20px',
    fontSize: '14px',
    marginRight: '5px',
  },
  successIcon: {
    margin: '30px 0',
  },
  successText: {
    color: '#878CA4',
  },
});

export default useStyles;
