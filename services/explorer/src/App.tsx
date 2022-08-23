import React from 'react';
import Footer from './components/Footer';
import logo from './logo.svg';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = () => {
  return (
    <>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
      <Footer />
    </>
  );
};

function App() {
  return <Root />;
}

export default App;
