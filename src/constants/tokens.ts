import { ChainId, Token } from '@ubeswap/sdk'
import { TokenList } from '@uniswap/token-lists'
import mapValues from 'lodash/mapValues'

const makeTokens = (
  addresses: { [net in ChainId]: string },
  decimals: number,
  symbol: string,
  name: string
): { [net in ChainId]: Token } => {
  return mapValues(addresses, (tokenAddress, network) => {
    return new Token(parseInt(network), tokenAddress, decimals, symbol, name)
  })
}

export const UBE = makeTokens(
  {
    [ChainId.MAINNET]: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
    [ChainId.ALFAJORES]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
    [ChainId.BAKLAVA]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
  },
  18,
  'MOBI',
  'Mobius DAO Token'
)

export const USD_LP = makeTokens(
  {
    [ChainId.MAINNET]: '0x751c70e8f062071bDE19597e2766a5078709FCb9',
    [ChainId.ALFAJORES]: '0x751c70e8f062071bDE19597e2766a5078709FCb9',
    [ChainId.BAKLAVA]: '0x751c70e8f062071bDE19597e2766a5078709FCb9',
  },
  18,
  'USD_LP',
  'USD LP Tokens'
)

const StableTokens: TokenList = {
  name: 'Mobius',
  timestamp: '2021-08-10T17:02:02.069Z',
  tokens: [
    {
      address: '0x9A5B788B4a3A128035e7a73e35832Cc5B4dFc77e',
      name: 'USD Coin',
      symbol: 'cUSDC',
      chainId: ChainId.ALFAJORES,
      decimals: 18,
      logoURI: 'https://bit.ly/3CwGimW',
    },
    {
      address: '0x0Ce734Ffe87e7EEaEf8ef4A97dA4261966Ae4bEa',
      name: 'Tether',
      symbol: 'cUSDT',
      chainId: ChainId.ALFAJORES,
      decimals: 18,
      logoURI: 'https://bit.ly/3AMrCyD',
    },
    {
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      name: 'Celo Dollar',
      symbol: 'cUSD',
      chainId: ChainId.ALFAJORES,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
    },
  ],
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
}

export default function getStableTokens(): TokenList {
  // for (const chainId in STATIC_POOL_INFO) {
  //   for (const pool in STATIC_POOL_INFO[chainId)) {
  //     console.log(pool)
  //   }
  // }
  // let pool: keyof typeof STATIC_POOL_INFO;
  // Object.values(STATIC_POOL_INFO).map(({ pool }) => console.log(pool))
  return StableTokens
}
