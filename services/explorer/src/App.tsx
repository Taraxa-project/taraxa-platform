import { Container, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';
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
import { NodeStateProvider, useExplorerNetwork } from './hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Network } from './utils';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = (): JSX.Element => {
  const { currentNetwork } = useExplorerNetwork();
  return (
    <>
      <Header />
      <Container maxWidth='xl' style={{ position: 'relative' }}>
        <LoadingWidget />
        <Box sx={{ px: 4 }}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/block' element={<BlocksPage />} />
            <Route path='/block/:txHash' element={<DAGDataContainer />} />
            <Route path='/pbft/:identifier' element={<PBFTDataContainer />} />
            <Route path='/node' element={<NodesPage />} />
            <Route path='/tx' element={<TransactionsPage />} />
            <Route path='/dag' element={<DagPage />} />
            <Route path='/tx/:txHash' element={<TransactionDataContainer />} />
            <Route path='/address/:account' element={<AddressInfoPage />} />
            {currentNetwork !== Network.MAINNET && (
              <Route path='/faucet' element={<FaucetPage />} />
            )}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <Footer />
        </Box>
      </Container>
    </>
  );
};

function App(): JSX.Element {
  const { graphQLClient } = useExplorerNetwork();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <UrqlProvider value={graphQLClient}>
      <QueryClientProvider client={queryClient}>
        <NodeStateProvider>
          <Root />
        </NodeStateProvider>
      </QueryClientProvider>
    </UrqlProvider>
  );
}

export default App;
