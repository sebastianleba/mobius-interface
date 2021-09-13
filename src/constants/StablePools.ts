import { ChainId, Fraction, JSBI, Token } from '@ubeswap/sdk'
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
  [ChainId.MAINNET]: '',
  [ChainId.ALFAJORES]: '0xad27574aF1d91ad9cB2a776c7BD6f0FB059EFe32',
  [ChainId.BAKLAVA]: '',
}

export const MOBI_TOKEN: { [K in ChainId]: Token | undefined } = {
  [ChainId.MAINNET]: undefined,
  [ChainId.ALFAJORES]: mobiToken(ChainId.ALFAJORES, '0x0745fCefEE0084296D876cDc179369B3A8A67AB2'),
  [ChainId.BAKLAVA]: undefined,
}

export const STATIC_POOL_INFO: { [K in ChainId]: StableSwapConstants[] } = {
  [ChainId.MAINNET]: [
    {
      name: 'USD Pool',
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
            symbol: 'cUSDC',
            name: 'US Dollar Coin',
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
      gaugeAddress: '0xb372c360Ab87A803CBB156eE6d62579545Bf3858',
      relativeGaugeWeight: new Fraction('1', '10'),
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
      gaugeAddress: '0x828e1Be170EcFF099Fd86396f76659359aBB2b4C',
      relativeGaugeWeight: new Fraction('9', '10'),
    },
  ],
  [ChainId.BAKLAVA]: [],
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
export const USD_POOL_ADDRESSES = {
  [ChainId.MAINNET]: null,
  [ChainId.ALFAJORES]: '0xe83e3750eeE33218586015Cf3a34c6783C0F63Ac',
  [ChainId.BAKLAVA]: null,
}
