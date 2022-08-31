import React from 'react';
import { Container, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header, Footer } from './components';
import HomePage from './pages/Home/Home';
import TransactionsPage from './pages/Transactions/Transactions';
import BlocksPage from './pages/Blocks/Blocks';
import NodesPage from './pages/Nodes/Nodes';
import TransactionDataContainer from './pages/TransactionData/TransactionData';
import BlockDataContainer from './pages/BlockData/BlockDataContainer';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = () => {
  return (
    <>
      <Header />
      <Container maxWidth='xl'>
        <Box sx={{ px: 4 }}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/blocks' element={<BlocksPage />} />
            <Route path='/blocks/:txHash' element={<BlockDataContainer />} />
            <Route path='/dag' element={<HomePage />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route
              path='/transactions/:txHash'
              element={<TransactionDataContainer />}
            />
            <Route path='/nodes' element={<NodesPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <Footer />
        </Box>
      </Container>
    </>
  );
};

function App() {
  return <Root />;
}

export default App;
