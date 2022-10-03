import React from 'react';
import { Container, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header, Footer } from './components';
import TransactionsPage from './pages/Transactions/Transactions';
import BlocksPage from './pages/Blocks/Blocks';
import NodesPage from './pages/Nodes/Nodes';
import TransactionDataContainer from './pages/TransactionData/TransactionData';
import AddressInfoPage from './pages/AddressInfo/AddressInfo';
import DAGDataContainer from './pages/BlockData/DAGDataContainer';
import FaucetPage from './pages/Faucet/Faucet';
import LoadingWidget from './components/LoadingWidget/LoadingWidget';
import HomePage from './pages/Home/Home';
import { DagPage } from './pages/Dag/Dag';
import PBFTDataContainer from './pages/PBFTData/PBFTDataContainer';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = (): JSX.Element => {
  return (
    <>
      <Header />
      <Container maxWidth='xl' style={{ position: 'relative' }}>
        <LoadingWidget />
        <Box sx={{ px: 4 }}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/blocks' element={<BlocksPage />} />
            <Route path='/blocks/:txHash' element={<DAGDataContainer />} />
            <Route path='/pbft/:identifier' element={<PBFTDataContainer />} />
            <Route path='/faucet' element={<FaucetPage />} />
            <Route path='/nodes' element={<NodesPage />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route path='/dag' element={<DagPage />} />
            <Route
              path='/transactions/:txHash'
              element={<TransactionDataContainer />}
            />
            <Route path='/address/:account' element={<AddressInfoPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <Footer />
        </Box>
      </Container>
    </>
  );
};

function App(): JSX.Element {
  return <Root />;
}

export default App;
