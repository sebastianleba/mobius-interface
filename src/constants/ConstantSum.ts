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
      address: '0x44c00D9e6e93209683e17D31491fB3C0D0417410',
      tokens: [
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
      ],
    },
    {
      // BTC v1/v2
      address: '0xf316FE2Dca5b458c87a0778d277a9655bCeB3f42',
      tokens: [
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
      ],
    },
    {
      // USDC v1/v2
      address: '0x70bfA1C8Ab4e42B9BE74f65941EFb6e5308148c7',
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
            decimals: 6,
            symbol: 'cUSDCxV1',
            name: 'US Dollar Coin (Optics Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
            decimals: 6,
            symbol: 'cUSDC',
            name: 'US Dollar Coin (Optics Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
    },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
