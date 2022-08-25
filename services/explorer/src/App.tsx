import React from 'react';
import { Container, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header, Footer } from './components';
import HomePage from './pages/Home/Home';
import TransactionsPage from './pages/Transactions/Transactions';

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
            <Route path='/dag' element={<HomePage />} />
            <Route path='/transactions' element={<TransactionsPage />} />
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
