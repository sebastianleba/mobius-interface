import { ChainId } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'

export type ConstantSumInfo = {
  address: string
  tokens: [WrappedTokenInfo, WrappedTokenInfo]
}

export const ConstantSum: { [K in ChainId]: ConstantSumInfo[] | undefined } = {
  [ChainId.MAINNET]: [
    {
      address: '0xd84fcdBA6995592BE73Ff6be888028ee49A79978',
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
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
