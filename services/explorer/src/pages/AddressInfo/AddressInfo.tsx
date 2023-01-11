import React from 'react';
import { useParams } from 'react-router-dom';
import { AddressInfo, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';

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
  } = useAddressInfoEffects(account);

  return (
    <>
      <PageTitle
        title='Address info'
        subtitle='Detailed TARAXA address information'
      />
      <AddressInfo
        details={addressInfoDetails}
        transactions={transactions}
        dagBlocks={dagBlocks}
        pbftBlocks={pbftBlocks}
        totalPbftCount={totalPbftCount}
        rowsPbftPerPage={rowsPbftPerPage}
        pbftPage={pbftPage}
        handlePbftChangePage={handlePbftChangePage}
        handlePbftChangeRowsPerPage={handlePbftChangeRowsPerPage}
      />
    </>
  );
};
export default AddressInfoPage;
