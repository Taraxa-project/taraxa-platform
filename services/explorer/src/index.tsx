import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
// import { theme } from '@taraxa_project/taraxa-ui';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ExplorerThemeProvider } from './theme-provider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ExplorerThemeProvider>
      <CssBaseline />
      <App />
    </ExplorerThemeProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
