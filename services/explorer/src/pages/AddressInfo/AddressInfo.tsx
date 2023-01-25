import React from 'react';
import { useParams } from 'react-router-dom';
import { AddressInfo, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';
import AddressLoadingSkeleton from './AddressLoadingSkeleton';

const AddressInfoPage = (): JSX.Element => {
  const { account } = useParams();
  const {
    isContract,
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
        <AddressInfo
          isContract={isContract}
          details={addressInfoDetails}
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
        />
      )}
    </>
  );
};
export default AddressInfoPage;
