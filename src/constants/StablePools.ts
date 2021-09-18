import { ChainId, Fraction, JSBI, Token } from '@ubeswap/sdk'
import { VestType } from 'state/claim/reducer'
import { WrappedTokenInfo } from 'state/lists/hooks'
import { StableSwapConstants } from 'state/stablePools/reducer'

export type StablePoolInfo = {
  poolAddress: string
  lpAddress: string
  token: Array<Token | string>
  name: string
}

const mobiToken = (chainId: number, address: string) => new Token(chainId, address, 18, 'MOBI', 'Mobius')

export const MOBIUS_STRIP_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0x20707684E796c7cb04CBB1a3bDB6AB40A02f2D12',
  [ChainId.BAKLAVA]: '',
}

export const MOBIUS_MINTER_ADDRESS: { [K in ChainId]: string } = {
  [ChainId.MAINNET]: '0xF94847bF134d72a6C5BFA4aE34Dd3930696B0600',
  [ChainId.ALFAJORES]: '0xa9f324CdB134f0b24094DCC80Fb720181e992437',
  [ChainId.BAKLAVA]: '',
}

export const MOBI_TOKEN: { [K in ChainId]: Token | undefined } = {
  [ChainId.MAINNET]: mobiToken(ChainId.MAINNET, '0xf0f4DF0cDE2C8cB8660ed022d7a22488F723e702'),
  [ChainId.ALFAJORES]: mobiToken(ChainId.ALFAJORES, '0x0745fCefEE0084296D876cDc179369B3A8A67AB2'),
  [ChainId.BAKLAVA]: undefined,
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
      displayDecimals: 0,
      gaugeAddress: '0xaD18fda9B6eBD42d8bADE94fe55144A79b2E8EDb',
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
            name: 'Wrapped Bitcoin (Optics Bride)',
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
      gaugeAddress: '0x4462ee6661FdD5B3e22E2D2105c300C74D0736D8',
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
      gaugeAddress: '0x721f77738857f9913dA0A72B6Cd30102A084141A',
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
      displayDecimals: 0,
      gaugeAddress: '0x8a7Ea00b6B7B191F8c425E1d803eFbb5070F6266',
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
      displayDecimals: 0,
      gaugeAddress: '0xaA8dD9a084dAD36c8a816bCaF66D852E7BdDDbC4',
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
      gaugeAddress: '0x1a567D4F6870Cd3eC1aD82f3CF8fF0EbCCbBfEcF',
      relativeGaugeWeight: new Fraction('1', '10'),
      displayDecimals: 0,
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
      gaugeAddress: '0x97Ae8F2962B8e6951CaF1868f31bD3DfD4093489',
      relativeGaugeWeight: new Fraction('9', '10'),
    },
  ],
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
        name: 'Wrapped Bitcoin (Optics Bride)',
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

export const STAKED_CELO_POOL: StablePoolInfo = {
  name: 'Staked CELO Pool',
  poolAddress: '0x000',
  lpAddress: '0x000',
  token: ['CELO', 'rCELO'],
}

export const USD_POOL: StablePoolInfo = {
  name: 'US Dollar Pool',
  poolAddress: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
  lpAddress: '0x000',
  token: ['cUSD', 'USDC', 'USDT'],
}

export const EURO_POOL: StablePoolInfo = {
  name: 'Euro Pool',
  poolAddress: '0x0000',
  lpAddress: '0x000',
  token: ['cEUR', 'bEURS', 'mcEUR'],
}

export const STABLE_POOLS = [STAKED_CELO_POOL, USD_POOL, EURO_POOL]

//todo: replace Mainnet and Baklava Pool Addresses
type AddressMap = { [K in ChainId]: string }

export const USD_POOL_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
  [ChainId.BAKLAVA]: '',
}

export const LP_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x7B7A47CC6f7d6EB9635792553A6E314898e3EFEB',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const FOUNDER_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0xaAB4a154EE836fcDaa706da7BE3Cd36d116dcF84',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const INVESTOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0xd40773280aBCD4F049AFEbBDE9779363Ba184540',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const ADVISOR_VEST_ADDRESSES: AddressMap = {
  [ChainId.MAINNET]: '0x25d43677DF8062Fd28dfd2Cfa31D0E1a2A56eF58',
  [ChainId.ALFAJORES]: '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
  [ChainId.BAKLAVA]: '',
}

export const VestingAddresses: { [type in VestType]: AddressMap } = {
  [VestType.FOUNDER]: FOUNDER_VEST_ADDRESSES,
  [VestType.ADVISOR]: ADVISOR_VEST_ADDRESSES,
  [VestType.INVESTOR]: INVESTOR_VEST_ADDRESSES,
  [VestType.LP]: LP_VEST_ADDRESSES,
}
