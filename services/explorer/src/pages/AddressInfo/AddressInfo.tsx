import React from 'react';
import { AddressInfo, PageTitle } from '../../components';
import { useAddressInfoEffects } from './AddressInfo.effects';

const AddressInfoPage = () => {
  const { transactions, addressInfoDetails } = useAddressInfoEffects();
  return (
    <>
      <PageTitle
        title='Address info'
        subtitle='Detailed TARAXA address information'
      />
      <AddressInfo blockData={transactions} {...addressInfoDetails} />
    </>
  );
};
export default AddressInfoPage;
