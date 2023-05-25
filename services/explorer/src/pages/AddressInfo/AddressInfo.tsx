import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper } from '@taraxa_project/taraxa-ui';
import { AddressDetails, AddressTables, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';
import AddressLoadingSkeleton from './AddressLoadingSkeleton';

const AddressInfoPage = (): JSX.Element => {
  const { account } = useParams();
  const {
    addressInfoDetails,
    showLoadingSkeleton,
    tabsStep,
    setTabsStep,
    isFetchingAddressStats,
    isLoadingAddressStats,
    pbftTablePagination,
    dagTablePagination,
    txTablePagination,
  } = useAddressInfoEffects(account);

  return (
    <>
      <PageTitle
        title='Address info'
        subtitle='Detailed TARAXA address information'
      />
      {showLoadingSkeleton ? (
        <AddressLoadingSkeleton />
      ) : (
        <Paper elevation={1}>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='left'
            margin='2rem 2rem 2rem'
            gap='1.5rem'
          >
            <AddressDetails
              details={addressInfoDetails}
              isFetchingAddressStats={isFetchingAddressStats}
              isLoadingAddressStats={isLoadingAddressStats}
            />
            <AddressTables
              pbftTablePagination={pbftTablePagination}
              dagTablePagination={dagTablePagination}
              txTablePagination={txTablePagination}
              tabsStep={tabsStep}
              setTabsStep={setTabsStep}
            />
          </Box>
        </Paper>
      )}
    </>
  );
};
export default AddressInfoPage;
