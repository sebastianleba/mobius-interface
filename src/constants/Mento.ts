import { ChainId } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { MentoConstants } from 'state/mentoPools/reducer'

export enum CeloStableToken {
  cUSD,
  cEUR,
  cBRL,
}

export const MENTO_POOL_INFO: { [K in ChainId]: MentoConstants[] } = {
  [ChainId.MAINNET]: [
    {
      stable: CeloStableToken.cUSD,
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            decimals: 18,
            symbol: 'CELO',
            name: 'Celo native asset',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
      ],
    },
    {
      stable: CeloStableToken.cEUR,
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            decimals: 18,
            symbol: 'CELO',
            name: 'Celo native asset',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
            decimals: 18,
            symbol: 'cEUR',
            name: 'Celo Euro',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cEUR.png',
          },
          []
        ),
      ],
    },
    {
      stable: CeloStableToken.cBRL,
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
            decimals: 18,
            symbol: 'CELO',
            name: 'Celo native asset',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
            decimals: 18,
            symbol: 'cREAL',
            name: 'Celo Real',
            logoURI: 'https://raw.githubusercontent.com/kyscott18/default-token-list/master/assets/asset_cREAL.png',
          },
          []
        ),
      ],
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
