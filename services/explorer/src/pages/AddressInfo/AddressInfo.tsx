import React from 'react';
import { useParams } from 'react-router-dom';
import { AddressInfo, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';

const AddressInfoPage = () => {
  const { txHash } = useParams();
  const { transactions, addressInfoDetails, dagBlocks, pbftBlocks } =
    useAddressInfoEffects(txHash);

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
      />
    </>
  );
};
export default AddressInfoPage;
