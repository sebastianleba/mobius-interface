import { ChainId } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'

export type ConstantSumInfo = {
  address: string
  tokens: [WrappedTokenInfo, WrappedTokenInfo]
}

export const ConstantSum: { [K in ChainId]: ConstantSumInfo[] | undefined } = {
  [ChainId.MAINNET]: [
    {
      // wETH v1/v2 pool
      address: '0xb4447a7de72Bd6d82dd459419b80feC37C8E43E3',
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
            decimals: 18,
            symbol: 'wETH',
            name: 'Wrapped Ether (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/weth_28.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
            decimals: 18,
            symbol: 'wETHxV1',
            name: 'Wrapped Ether (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/weth_28.png',
          },
          []
        ),
      ],
    },
    {
      address: '0x6a805296bBCAb0e917FefFA948a68786DA064011',
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B',
            decimals: 8,
            symbol: 'wBTC',
            name: 'Wrapped Bitcoin (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
            decimals: 8,
            symbol: 'wBTCxV1',
            name: 'Wrapped Bitcoin (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
          },
          []
        ),
      ],
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
