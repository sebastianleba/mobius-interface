import { ChainId, JSBI, Token } from '@ubeswap/sdk'
import { StableSwapConstants } from 'state/stablePools/reducer'

export type StablePoolInfo = {
  poolAddress: string
  lpAddress: string
  token: Array<Token | string>
  name: string
}

export const STATIC_POOL_INFO: { [K in ChainId]: StableSwapConstants[] } = {
  [ChainId.MAINNET]: [],
  [ChainId.ALFAJORES]: [
    {
      tokenAddresses: ['0xa3629788a1a5276dD0586D270B899A32bEE4680f', '0x5eA9Ab65b4Fe4D8A866Ee119Fa07C26BA57b8764'],
      address: '0xa06A9fc206981eeca570Da400A16119A55e5b429',
      lpToken: new Token(ChainId.ALFAJORES, '0xa3629788a1a5276dD0586D270B899A32bEE4680f', 18),
      fee: JSBI.BigInt('0'),
      rates: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      lendingPrecision: JSBI.BigInt('1'),
      precision: JSBI.BigInt('18'),
      feeDenominator: JSBI.BigInt('10000000000'),
      precisionMul: [JSBI.BigInt('1'), JSBI.BigInt('1')],
      feeIndex: 0,
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
