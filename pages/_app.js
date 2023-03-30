
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ChakraProvider, useColorMode } from '@chakra-ui/react'
import Layout from '../components/layout'
import { useTheme } from '@chakra-ui/react'
// import { scrollTestnet } from 'wagmi/chains'

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme, lightTheme, midnightTheme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';


// const scroll = {
//   id: 534353,
//   name: 'Scroll Alpha Testnet',
//   network: 'scroll',
//   nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
//   rpcUrls: {
//     default: "https://alpha-rpc.scroll.io/l2",
//   },
//   blockExplorers: {
//     default: "https://blockscout.scroll.io",
//   }
// }
const zkSyncTestnet = {
  id: 280,
  name: 'zkSync Era Testnet',
  network: 'zkSyncTestnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http:["https://testnet.era.zksync.dev"],
    }
  },
  blockExplorers: {
    default: "goerli.explorer.zksync.io",
  }
}
const zkSyncEra = {
  id: 324,
  name: 'zkSync Era Mainnet',
  network: 'zkSyncTestnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http:["https://mainnet.era.zksync.io"],
    }
  },
  blockExplorers: {
    default: "https://explorer.zksync.io",
  }
}

const { chains, provider } = configureChains(
  [zkSyncEra],
  [
    alchemyProvider({ alchemyId: process.env.ALCHEMY_ID}),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})
function MyApp({ Component, pageProps }) {
  const theme = useTheme()

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} >
        <ChakraProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
