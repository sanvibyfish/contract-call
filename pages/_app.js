
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ChakraProvider, useColorMode } from '@chakra-ui/react'
import Layout from '../components/layout'
import { useTheme } from '@chakra-ui/react'

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
const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum, chain.rinkeby],
  [
    alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }),
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
  console.log(theme)

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
