import { Box, Paper } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import { AddressDetails, AddressTables, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';
import AddressLoadingSkeleton from './AddressLoadingSkeleton';

const AddressInfoPage = (): JSX.Element => {
  const { account } = useParams();
  const {
    transactions,
    addressInfoDetails,
    dagBlocks,
    pbftBlocks,
    totalPbftCount,
    pbftPage,
    rowsPbftPerPage,
    handlePbftChangePage,
    handlePbftChangeRowsPerPage,
    totalDagCount,
    rowsDagPerPage,
    dagPage,
    handleDagChangePage,
    handleDagChangeRowsPerPage,
    totalTxCount,
    rowsTxPerPage,
    txPage,
    handleTxChangePage,
    handleTxChangeRowsPerPage,
    showLoadingSkeleton,
    tabsStep,
    setTabsStep,
    isFetchingAddressStats,
    isLoadingAddressStats,
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
              transactions={transactions}
              dagBlocks={dagBlocks}
              pbftBlocks={pbftBlocks}
              totalPbftCount={totalPbftCount}
              rowsPbftPerPage={rowsPbftPerPage}
              pbftPage={pbftPage}
              handlePbftChangePage={handlePbftChangePage}
              handlePbftChangeRowsPerPage={handlePbftChangeRowsPerPage}
              totalDagCount={totalDagCount}
              rowsDagPerPage={rowsDagPerPage}
              dagPage={dagPage}
              handleDagChangePage={handleDagChangePage}
              handleDagChangeRowsPerPage={handleDagChangeRowsPerPage}
              totalTxCount={totalTxCount}
              rowsTxPerPage={rowsTxPerPage}
              txPage={txPage}
              handleTxChangePage={handleTxChangePage}
              handleTxChangeRowsPerPage={handleTxChangeRowsPerPage}
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
