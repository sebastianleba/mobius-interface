import { Alfajores, Mainnet, Network } from '@celo-tools/use-contractkit'

import { MultiChainIds } from './Optics'

export { Alfajores, Mainnet } from '@celo-tools/use-contractkit'

export function getExplorerLink(
  chainId: number,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const chain = chainId as unknown as MultiChainIds
  const prefix = networkInfo[chain].explorer

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/tokens/${data}`
    }
    case 'block': {
      return `${prefix}/blocks/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export type NetworkInfo = Network & {
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const Ethereum: NetworkInfo = {
  name: 'Ethereum',
  chainId: 1,
  rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  explorer: 'https://etherscan.io/',
  graphQl: '',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
}

export const Polygon: NetworkInfo = {
  name: 'Polygon',
  chainId: 137,
  rpcUrl: `https://rpc-mainnet.matic.network`,
  explorer: 'https://polygonscan.com/',
  graphQl: '',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
}

export const MainnetNetworks = [Mainnet, Ethereum, Polygon]

export const Kovan: NetworkInfo = {
  name: 'Kovan',
  chainId: 42,
  rpcUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  explorer: 'https://kovan.etherscan.io/',
  graphQl: '',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
}

export const Rinkeby: NetworkInfo = {
  name: 'Rinkeby',
  chainId: 4,
  rpcUrl: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  explorer: 'https://rinkeby.etherscan.io/',
  graphQl: '',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
}

export const Celo: NetworkInfo = {
  ...Mainnet,
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
  },
}

export const Alfa: NetworkInfo = {
  ...Alfajores,
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
  },
}

export const DevNetworks = [Alfajores, Kovan, Rinkeby]
export const networkInfo: { [id in MultiChainIds]: NetworkInfo } = {
  [MultiChainIds.ETHEREUM]: Ethereum,
  [MultiChainIds.CELO]: Celo,
  [MultiChainIds.ALFAJORES]: Alfa,
  [MultiChainIds.POLYGON]: Polygon,
  [MultiChainIds.BAKLAVA]: Alfa,
  [MultiChainIds.RINKEBY]: Rinkeby,
  [MultiChainIds.KOVAN]: Kovan,
}
