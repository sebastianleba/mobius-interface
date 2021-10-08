import { StableToken } from '@celo/contractkit'
import { ChainId, Fraction, JSBI, Token } from '@ubeswap/sdk'
import { VestType } from 'state/claim/reducer'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { MentoConstants } from 'state/mentoPools/reducer'
import { StableSwapConstants } from 'state/stablePools/reducer'

const mobiToken = (chainId: number, address: string) =>
  new WrappedTokenInfo(
    {
      chainId,
      address,
      decimals: 18,
      symbol: 'MOBI',
      name: 'Mobius DAO Token',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_MOBI.png',
    },
    []
  )

export enum Coins {
  Bitcoin,
  Ether,
  USD,
}

export const PRICE: { [c in Coins]: number } = {
  [Coins.Bitcoin]: 42295,
  [Coins.Ether]: 2909,
  [Coins.USD]: 1,
}

export const MOBIUS_STRIP_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0x20707684E796c7cb04CBB1a3bDB6AB40A02f2D12',
  [ChainId.BAKLAVA]: '',
}

export const MOBIUS_MINTER_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0x5F0200CA03196D5b817E2044a0Bb0D837e0A7823',
  [ChainId.ALFAJORES]: '0x5c212FA1cf8b1143f2142C26161e65404034c01f',
  [ChainId.BAKLAVA]: '',
}

export const MOBI_TOKEN: { [K in ChainId]: Token | undefined } = {
  [ChainId.MAINNET]: mobiToken(ChainId.MAINNET, '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B'),
  [ChainId.ALFAJORES]: mobiToken(ChainId.ALFAJORES, '0x6dDcbC22c1ED5D0662635ffb020c82DF4e1Ba234'),
  [ChainId.BAKLAVA]: undefined,
}

export const GAUGE_CONTROLLER: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7530E03056D3a8eD0323e61091ea2f17a1aC5C25',
  [ChainId.ALFAJORES]: '0x00063Fbe0c90834EE90C6191d0D9F04eaB01A14f',
  [ChainId.BAKLAVA]: '',
}

export const VOTING_ESCROW: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0xd813a846aA9D572140d7ABBB4eFaC8cD786b4c0E',
  [ChainId.ALFAJORES]: '0xFe2434bcE62C9B4845fe0C57438f5F86fA4771A7',
  [ChainId.BAKLAVA]: '',
}

export const STATIC_POOL_INFO: { [K in ChainId]: StableSwapConstants[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'USDC (Optics Bridge) Pool',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7'],
      tokens: [
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
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
            decimals: 6,
            symbol: 'cUSDC',
            name: 'US Dollar Coin (Optics Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0xA5037661989789d0310aC2B796fa78F1B01F195D',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
        18,
        'MobLP',
        'Mobius cUSD/cUSDC(O) LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 1,
      gaugeAddress: '0xdAA2ab880b7f3D5697e6F85e63c28b9120AA9E07',
      totalMobiRate: JSBI.BigInt('1467123000000000000'),
    },
    {
      name: 'USDC (Solana AllBridge) Pool',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xCD7D7Ff64746C1909E44Db8e95331F9316478817'],
      tokens: [
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
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xCD7D7Ff64746C1909E44Db8e95331F9316478817',
            decimals: 18,
            symbol: 'asUSDC',
            name: 'US Dollar Coin (Solana AllBridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x63C1914bf00A9b395A2bF89aaDa55A5615A3656e',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xAFEe90ab6A2D3B265262f94F6e437E7f6d94e26E',
        18,
        'MobLP',
        'Mobius cUSD/asUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 1,
      gaugeAddress: '0x27D9Bfa5F864862BeDC23cFab7e00b6b94488CC6',
      totalMobiRate: JSBI.BigInt('1467123000000000000'),
    },
    {
      name: 'USDC (PoS Optics) Pool',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941'],
      tokens: [
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
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
            decimals: 6,
            symbol: 'pUSDC',
            name: 'USD Coin (PoS Optics)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x2080AAa167e2225e1FC9923250bA60E19a180Fb2',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xf5b454cF47Caca418D95930AA03975Ee4bf409bc',
        18,
        'MobLP',
        'Mobius cUSD/pUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('6')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x52517feb1Fc6141d5CF6718111C7Cc0FD764fA5d',
      totalMobiRate: JSBI.BigInt('1467123000000000000'),
    },
    {
      name: 'BTC Pool',
      tokenAddresses: ['0xD629eb00dEced2a080B7EC630eF6aC117e614f1b', '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
            decimals: 18,
            symbol: 'cBTC',
            name: 'Wrapped Bitcoin',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
            decimals: 8,
            symbol: 'wBTC(O)',
            name: 'Wrapped Bitcoin (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
          },
          []
        ),
      ],
      address: '0x19260b9b573569dDB105780176547875fE9fedA3',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x8cD0E2F11ed2E896a8307280dEEEE15B27e46BbE',
        18,
        'MobLP',
        'Mobius cBTC/wBTC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('8')],
      peggedTo: '₿',
      pegComesAfter: true,
      displayDecimals: 3,
      gaugeAddress: '0x1A8938a37093d34581B21bAd2AE7DC1c19150C05',
      totalMobiRate: JSBI.BigInt('440137000000000000'),
    },
    {
      name: 'ETH Pool',
      tokenAddresses: ['0x2DEf4285787d58a2f811AF24755A8150622f4361', '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
            decimals: 18,
            symbol: 'cETH',
            name: 'Wrapped Ethereum',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cETH.svg',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
            decimals: 18,
            symbol: 'wETH',
            name: 'Wrapped Ether (Optics Bridge)',
            logoURI: 'https://etherscan.io/token/images/weth_28.png',
          },
          []
        ),
      ],
      address: '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x846b784Ab5302155542c1B3952B54305F220fd84',
        18,
        'MobLP',
        'Mobius cETH/wETH LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'Ξ',
      pegComesAfter: true,
      displayDecimals: 2,
      gaugeAddress: '0xD38e76E17E66b562B61c149Ca0EE53CEa1145733',
      totalMobiRate: JSBI.BigInt('440137000000000000'),
    },
    {
      name: 'USDT (Moss Bridge) Pool',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D'],
      tokens: [
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
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
            decimals: 18,
            symbol: 'cUSDTm',
            name: 'Tether (Moss Bridge)',
            logoURI: 'https://bit.ly/3AMrCyD',
          },
          []
        ),
      ],
      address: '0xdBF27fD2a702Cc02ac7aCF0aea376db780D53247',
      lpToken: new Token(
        ChainId.MAINNET,
        '0xC7a4c6EF4A16Dc24634Cc2A951bA5Fec4398f7e0',
        18,
        'MobLP',
        'Mobius cUSD/cUSDT LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 1,
      gaugeAddress: '0xe2d6095685248F38Ae9fef1b360D772b78Ea19D1',
      totalMobiRate: JSBI.BigInt('146712000000000000'),
    },
    {
      name: 'USDC (Moss Bridge) Pool',
      tokenAddresses: ['0x765DE816845861e75A25fCA122bb6898B8B1282a', '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e'],
      tokens: [
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
        new WrappedTokenInfo(
          {
            chainId: ChainId.MAINNET,
            address: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
            decimals: 18,
            symbol: 'cUSDCm',
            name: 'US Dollar Coin (Moss Bridge)',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0x0ff04189Ef135b6541E56f7C638489De92E9c778',
      lpToken: new Token(
        ChainId.MAINNET,
        '0x635aec36c4b61bac5eB1C3EEe191147d006F8a21',
        18,
        'MobLP',
        'Mobius cUSD/cUSDC LP'
      ),
      swapFee: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('7')),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('10')),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 1,
      gaugeAddress: '0xd1B3C05FE24bda6F52e704daf1ACBa8c440d8573',
      totalMobiRate: JSBI.BigInt('440137000000000000'),
    },
  ],
  [ChainId.ALFAJORES]: [
    {
      name: 'Celo Pool',
      tokenAddresses: ['0x2AaF20d89277BF024F463749045964D7e7d3A774', '0x3551d53C9CF91E222D9579A1Ac4B44117E8Ec609'],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.ALFAJORES,
            address: '0x2AaF20d89277BF024F463749045964D7e7d3A774',
            decimals: 18,
            symbol: 'cTC1',
            name: 'Test Coin 1',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_sCELO.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.ALFAJORES,
            address: '0x3551d53C9CF91E222D9579A1Ac4B44117E8Ec609',
            decimals: 18,
            symbol: 'cTC2',
            name: 'Test Coin 2',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_rCELO.png',
          },
          []
        ),
      ],
      address: '0xaAB4a154EE836fcDaa706da7BE3Cd36d116dcF84',
      lpToken: new Token(
        ChainId.ALFAJORES,
        '0x5078111F81481C3583d6011355e69C44B3FF253d',
        18,
        'MobiLP',
        'Mobius Celo LP'
      ),
      swapFee: JSBI.BigInt('50000000'),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.BigInt('10000000000'),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: 'CELO',
      pegComesAfter: true,
      gaugeAddress: '0x8222452cF3780825aA657B40C63D492F33F28bF6',
      relativeGaugeWeight: new Fraction('1', '10'),
      displayDecimals: 0,
      additionalRewards: [
        '0x2AaF20d89277BF024F463749045964D7e7d3A774',
        '0x3551d53C9CF91E222D9579A1Ac4B44117E8Ec609',
        '0x7588110A070987ea0347Cf788226c28d1476d641',
      ],
    },
    {
      name: 'USD Pool',
      tokenAddresses: [
        '0x7588110A070987ea0347Cf788226c28d1476d641',
        '0x17Ec8dab839a9880D656c3cEF40cf4038657d168',
        '0xCC531BfBA46cA251D3D9f3aCc37ABD5DCF3ed0B3',
      ],
      tokens: [
        new WrappedTokenInfo(
          {
            chainId: ChainId.ALFAJORES,
            address: '0x7588110A070987ea0347Cf788226c28d1476d641',
            decimals: 18,
            symbol: 'cUSD',
            name: 'Celo Dollar',
            logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.ALFAJORES,
            address: '0x17Ec8dab839a9880D656c3cEF40cf4038657d168',
            decimals: 18,
            symbol: 'USDT',
            name: 'Tether',
            logoURI: 'https://bit.ly/3AMrCyD',
          },
          []
        ),
        new WrappedTokenInfo(
          {
            chainId: ChainId.ALFAJORES,
            address: '0xCC531BfBA46cA251D3D9f3aCc37ABD5DCF3ed0B3',
            decimals: 18,
            symbol: 'USDC',
            name: 'US Dollar Coin',
            logoURI: 'https://bit.ly/3CwGimW',
          },
          []
        ),
      ],
      address: '0xFB80520416685420751B2CD8E2c305aCbd5F756E',
      lpToken: new Token(
        ChainId.ALFAJORES,
        '0x18B1cC7ac290591853b9728BF0a88085EBc7F981',
        18,
        'MobiLP',
        'Mobius USD LP'
      ),
      swapFee: JSBI.BigInt('10000000'),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.BigInt('10000000000'),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
      decimals: [JSBI.BigInt('18'), JSBI.BigInt('18'), JSBI.BigInt('18')],
      peggedTo: '$',
      pegComesAfter: false,
      displayDecimals: 0,
      gaugeAddress: '0x9f2de5d953174bCfFA96f78d18a93b85BC5b8fc3',
      relativeGaugeWeight: new Fraction('9', '10'),
    },
  ],
  [ChainId.BAKLAVA]: [],
}

export const MENTO_POOL_INFO: { [K in ChainId]: MentoConstants[] } = {
  [ChainId.MAINNET]: [
    {
      stable: StableToken.cUSD,
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
      stable: StableToken.cEUR,
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
  ],
  [ChainId.ALFAJORES]: [],
  [ChainId.BAKLAVA]: [],
}

export const TOKENS: { [chain in ChainId]: { [address: string]: Token } } = {
  [ChainId.MAINNET]: {
    ['0x765DE816845861e75A25fCA122bb6898B8B1282a']: new WrappedTokenInfo(
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
    ['0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7']: new WrappedTokenInfo(
      {
        chainId: ChainId.MAINNET,
        address: '0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7',
        decimals: 6,
        symbol: 'cUSDC',
        name: 'US Dollar Coin (Optics Bridge)',
        logoURI: 'https://bit.ly/3CwGimW',
      },
      []
    ),
    ['0xD629eb00dEced2a080B7EC630eF6aC117e614f1b']: new WrappedTokenInfo(
      {
        chainId: ChainId.MAINNET,
        address: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
        decimals: 18,
        symbol: 'cBTC',
        name: 'Wrapped Bitcoin',
        logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cBTC.png',
      },
      []
    ),
    ['0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE']: new WrappedTokenInfo(
      {
        chainId: ChainId.MAINNET,
        address: '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
        decimals: 8,
        symbol: 'wBTC(O)',
        name: 'Wrapped Bitcoin (Optics Bridge)',
        logoURI: 'https://etherscan.io/token/images/wbtc_28.png?v=1',
      },
      []
    ),
    ['0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D']: new WrappedTokenInfo(
      {
        chainId: ChainId.MAINNET,
        address: '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
        decimals: 18,
        symbol: 'cUSDTm',
        name: 'Tether (Moss Bridge)',
        logoURI: 'https://bit.ly/3AMrCyD',
      },
      []
    ),
    ['0x93DB49bE12B864019dA9Cb147ba75cDC0506190e']: new WrappedTokenInfo(
      {
        chainId: ChainId.MAINNET,
        address: '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
        decimals: 18,
        symbol: 'cUSDCm',
        name: 'US Dollar Coin (Moss Bridge)',
        logoURI: 'https://bit.ly/3CwGimW',
      },
      []
    ),
  },
  [ChainId.ALFAJORES]: {},
  [ChainId.BAKLAVA]: {},
}

//todo: replace Mainnet and Baklava Pool Addresses
type AddressMap = { [K in ChainId]: string }

export const USD_POOL_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
  [ChainId.BAKLAVA]: '',
}

export const LP_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x74Fc71eF736feeaCfd58aeb2543c5fe4d33aDc14',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const FOUNDER_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x34deFd314fa23821a87FCbF5393311Bc5B7608C1',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const INVESTOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x5498248EaB20ff314bC465268920B48eed4Cdb7C',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const ADVISOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x54Bf52862E1Fdf0D43D9B19Abb5ec72acA0a25A6',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const VestingAddresses: { [type in VestType]: AddressMap } = {
  [VestType.FOUNDER]: FOUNDER_VEST_ADDRESSES,
  [VestType.ADVISOR]: ADVISOR_VEST_ADDRESSES,
  [VestType.INVESTOR]: INVESTOR_VEST_ADDRESSES,
  [VestType.LP]: LP_VEST_ADDRESSES,
}
