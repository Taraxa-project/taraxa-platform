import React from 'react';
import { Header, Footer } from './components';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = () => {
  return (
    <>
      <Header />
      <Footer />
    </>
  );
};

function App() {
  return <Root />;
}

export default App;
