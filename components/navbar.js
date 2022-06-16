import { MoonIcon,SunIcon } from '@chakra-ui/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  IconButton,
  Link,
  useColorMode
} from '@chakra-ui/react'
export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <div className="flex pt-6">
      <div className='flex'>
        <Link href="/contract">合约调用</Link>
        <Link href="/nft/freemint" className="ml-6">FreeMint监控</Link>
        <Link href="/nft/threefish" className="ml-6">图狗案例</Link>
      </div>
      <div className="flex flex-row ml-auto">
        <IconButton onClick={toggleColorMode} className="mr-6" icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />} />
        <ConnectButton />
      </div>
    </div>
  )
}