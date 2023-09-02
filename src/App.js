import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { ToastContainer } from 'react-toastify';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  mainnet, polygon, goerli, zkSyncTestnet, polygonMumbai, arbitrum, arbitrumGoerli,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  createBrowserRouter, RouterProvider, Route, Routes, createHashRouter,
} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import BuyFromPool from './pages/BuyFromPool';
import SellToPool from './pages/SellToPool';
// import Home from './pages/Home';
import MathLib from './pages/MathLib';
import CreatePool from './pages/CreatePool';

const neoevm = {
  id: 2970385,
  name: 'NeoEVM Chain',
  network: 'NeoEVM Chain',
  iconBackground: '#008000',
  nativeCurrency: {
    decimals: 18,
    name: 'GAS',
    symbol: 'GAS',
  },
  rpcUrls: {
    public: { http: ['https://evm.ngd.network:32331'] },
    default: { http: ['https://evm.ngd.network:32331'] },
  },
  blockExplorers: {
    default: { name: 'ngd', url: 'https://evm.ngd.network/' },
    etherscan: { name: 'ngd', url: 'https://evm.ngd.network/' },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [goerli, polygon, polygonMumbai, arbitrum, arbitrumGoerli, zkSyncTestnet, neoevm],
  [
    alchemyProvider({ apiKey: 'eeb2JnW2JdlOkqPH6NZVhVpRSXKaSW8D' }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const router = createHashRouter([
  {
    path: '/',
    element: <MathLib />,
  },
  {
    path: '/buy',
    element: <BuyFromPool />,
  },
  {
    path: '/sell',
    element: <SellToPool />,
  },
  {
    path: 'mathlib',
    element: <MathLib />,
  },
  {
    path: 'createPool',
    element: <CreatePool />,
  },
]);

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <RouterProvider router={router} />
        <ToastContainer />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
