import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import {
  createClient as urqlCreatClient,
  Provider as UrqlProvider,
} from 'urql';
import { QueryClientProvider, QueryClient } from 'react-query';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ExplorerThemeProvider } from './theme-provider';
import { GRAPHQL_API } from './api';
import {
  ExplorerNetworkProvider,
  ExplorerLoaderProvider,
  NodeStateProvider,
} from './hooks';

export const graphQLClient = urqlCreatClient({
  url: GRAPHQL_API,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ExplorerThemeProvider>
      <ExplorerNetworkProvider>
        <UrqlProvider value={graphQLClient}>
          <QueryClientProvider client={queryClient}>
            <NodeStateProvider>
              <ExplorerLoaderProvider>
                <BrowserRouter>
                  <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
                    <App />
                  </SnackbarProvider>
                </BrowserRouter>
              </ExplorerLoaderProvider>
            </NodeStateProvider>
          </QueryClientProvider>
        </UrqlProvider>
      </ExplorerNetworkProvider>
    </ExplorerThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
