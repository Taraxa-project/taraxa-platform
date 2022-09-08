import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import {
  createClient as urqlCreatClient,
  Provider as UrqlProvider,
} from 'urql';
import App from './App';
import { ExplorerNetworkProvider } from './hooks/useExplorerNetwork';
import reportWebVitals from './reportWebVitals';
import { ExplorerThemeProvider } from './theme-provider';
import { ExplorerLoaderProvider } from './hooks/useLoader';
import { GRAPHQL_API } from './api';

export const graphQLClient = urqlCreatClient({
  url: GRAPHQL_API,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ExplorerThemeProvider>
      <ExplorerNetworkProvider>
        <ExplorerLoaderProvider>
          <UrqlProvider value={graphQLClient}>
            <BrowserRouter>
              <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
                <App />
              </SnackbarProvider>
            </BrowserRouter>
          </UrqlProvider>
        </ExplorerLoaderProvider>
      </ExplorerNetworkProvider>
    </ExplorerThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
