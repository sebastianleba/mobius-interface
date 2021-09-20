import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'

import { StablePoolInfo } from '../state/stablePools/hooks'

const dummyToken = new Token(1, '0x8cD0E2F11ed2E896a8307280dEEEE15B27e46BbE', 18, 'MobLP', 'Mobius cBTC/wBTC LP')
const dummyAmount = new TokenAmount(dummyToken, '0')

const BTC_POOL_ADDRESS = '0x19260b9b573569dDB105780176547875fE9fedA3'
const ETH_POOL_ADDRESS = '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'
const CURRENT_BTC_USD_PRICE = JSBI.BigInt('45774')
const CURRENT_ETH_USD_PRICE = JSBI.BigInt('3202')

export const getLpPriceUSD = (poolAddress: string) =>
  poolAddress === BTC_POOL_ADDRESS
    ? CURRENT_BTC_USD_PRICE
    : poolAddress === ETH_POOL_ADDRESS
    ? CURRENT_ETH_USD_PRICE
    : JSBI.BigInt('1')

const scaleAmount =
  (toScale: JSBI) =>
  (ta: TokenAmount | undefined, addition = JSBI.BigInt('0')) =>
    toScale && ta
      ? new TokenAmount(ta.token, JSBI.multiply(JSBI.add(addition, ta.raw), toScale))
      : new TokenAmount(dummyToken, '0')

export const getDepositValues = (
  pool: StablePoolInfo | undefined
): {
  valueOfStaked: TokenAmount
  valueOfDeposited: TokenAmount
  totalValueDeposited: TokenAmount
  totalValueStaked: TokenAmount
} => {
  if (!pool)
    return {
      valueOfDeposited: dummyAmount,
      valueOfStaked: dummyAmount,
      totalValueDeposited: dummyAmount,
      totalValueStaked: dummyAmount,
    }
  const { totalDeposited, amountDeposited, virtualPrice, stakedAmount, totalStakedAmount, lpToken } = pool
  const scale = scaleAmount(JSBI.divide(virtualPrice, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))))

  const valueOfStaked = scale(stakedAmount)
  const valueOfDeposited = scale(amountDeposited, stakedAmount?.raw)
  const totalValueStaked = scale(totalStakedAmount)
  const totalValueDeposited = scale(totalDeposited)
  return {
    valueOfStaked,
    valueOfDeposited,
    totalValueDeposited,
    totalValueStaked,
  }
}
