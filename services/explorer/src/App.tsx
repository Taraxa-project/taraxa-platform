import React from 'react';
import { Route, Routes } from 'react-router-dom';
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
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/transactions' element={<TransactionsPage />} />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return <Root />;
}

export default App;
