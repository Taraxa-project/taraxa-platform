import React from 'react';
import { Box } from '@mui/material';
import { AddressInfo, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';

const AddressInfoPage = () => {
  const { transactions } = useAddressInfoEffects();
  return (
    <>
      <PageTitle
        title='Address info'
        subtitle='Detailed TARAXA address information'
      />
      <Box sx={{ display: 'flex', gap: '24px', width: '100%' }}>
        <AddressInfo
          address='test'
          blockData={transactions}
          balance='123'
          value='123'
          transactionCount={240}
          totalReceived='2123'
          totalSent='123'
          fees='123'
          dagBlocks={123}
          pbftBlocks={123}
        />
      </Box>
    </>
  );
};
export default AddressInfoPage;
