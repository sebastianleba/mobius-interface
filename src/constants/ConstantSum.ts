import { ChainId, Token } from '@ubeswap/sdk'
import { WrappedTokenInfo } from 'state/lists/hooks'

export type ConstantSumInfo = {
  name: string
  address: string
  tokens: [WrappedTokenInfo, WrappedTokenInfo]
  lpToken: Token
}

export const ConstantSum: { [K in ChainId]: ConstantSumInfo[] | undefined } = {
  [ChainId.MAINNET]: [
    {
      // wETH v1/v2 pool
      name: 'wETH v1/v2 pool',
      address: '0xb1a0BDe36341065cA916c9f5619aCA82A43659A3',
      lpToken: new Token(ChainId.MAINNET, '0x772bf80363d40c6a8305da935c063cd3203d16cc', 18),
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
    // {
    //   // wETH v1/v2 pool 0x4a4cd1df17c79ef74733e46a84e37b7f6b9ea914
    //   name: 'TEST v1/v2 pool',
    //   address: '0x7e0B5284864916A866Fc391454ac2f452F91a336',
    //   lpToken: new Token(ChainId.MAINNET, '0x4a4cd1df17c79ef74733e46a84e37b7f6b9ea914', 18),
    //   tokens: [
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xD68536297a01DBB4739a4e2cC1E79a8CFA2E3A3E',
    //         decimals: 18,
    //         symbol: 'wETHxV1',
    //         name: 'Wrapped Ether (Optics Bridge)',
    //         logoURI: 'https://etherscan.io/token/images/weth_28.png',
    //       },
    //       []
    //     ),
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xb909F71b53C621e467Ee9ECD387E6662CA4f15eF',
    //         decimals: 18,
    //         symbol: 'wETH',
    //         name: 'Wrapped Ether (Optics Bridge)',
    //         logoURI: 'https://etherscan.io/token/images/weth_28.png',
    //       },
    //       []
    //     ),
    //   ],
    // },
    {
      // BTC v1/v2
      name: 'wBTC v1/v2 pool',
      address: '0xd5ab1BA8b2Ec70752068d1d728e728eAd0E19CBA',
      lpToken: new Token(ChainId.MAINNET, '0x301897c5fc341ec0daab2b61893cb8e5d314a1b1', 18),
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
      name: 'USDC v1/v2 pool',
      address: '0x70bfA1C8Ab4e42B9BE74f65941EFb6e5308148c7',
      lpToken: new Token(ChainId.MAINNET, '0xe440a01eaf67b88381f2baa7de4538f8503683a0', 18),
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
    // {
    //   // TEST pool
    //   address: '0xdd61Ab1e6a9A18ad16F952e23e973C94E877e809',
    //   tokens: [
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xC271C9c30C0185d461B51D6B2C8A71EA8E541FBE',
    //         decimals: 8,
    //         symbol: 'TESTxV1',
    //         name: 'US Dollar Coin (Optics Bridge)',
    //         logoURI: 'https://bit.ly/3CwGimW',
    //       },
    //       []
    //     ),
    //     new WrappedTokenInfo(
    //       {
    //         chainId: ChainId.MAINNET,
    //         address: '0xf505453b50477a6099E9a86b2B7977Ff6F7Fa306',
    //         decimals: 8,
    //         symbol: 'TEST',
    //         name: 'US Dollar Coin (Optics Bridge)',
    //         logoURI: 'https://bit.ly/3CwGimW',
    //       },
    //       []
    //     ),
    //   ],
    // },
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}
