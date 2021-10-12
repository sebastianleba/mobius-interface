import { JSBI, Percent, TokenAmount } from '@ubeswap/sdk'
import { GaugeSummary } from 'state/staking/hooks'

export function calcBoost(summary: GaugeSummary, votingPower: JSBI, totalVotingPower: JSBI): Percent {
  const { baseBalance, totalStaked } = summary
  let weighted = JSBI.divide(JSBI.multiply(JSBI.BigInt(4), baseBalance.raw), JSBI.BigInt(10))
  if (JSBI.greaterThan(totalVotingPower, JSBI.BigInt('0'))) {
    weighted = JSBI.add(
      JSBI.divide(JSBI.multiply(JSBI.BigInt(4), baseBalance.raw), JSBI.BigInt(10)),
      JSBI.divide(
        JSBI.multiply(JSBI.BigInt(6), JSBI.multiply(totalStaked.raw, votingPower)),
        JSBI.multiply(totalVotingPower, JSBI.BigInt(10))
      )
    )
  }
  const min = JSBI.lessThan(weighted, baseBalance.raw) ? weighted : baseBalance.raw
  return new Percent(min, JSBI.divide(JSBI.multiply(JSBI.BigInt(4), baseBalance.raw), JSBI.BigInt(10)))
}

const MILLISECONDS_IN_FOUR_YEARS = JSBI.BigInt(4 * 365 * 24 * 3600 * 1000)

export function calcExpectedVeMobi(amount: TokenAmount, lockEnd: number): TokenAmount {
  const newAmount = JSBI.divide(JSBI.multiply(amount.raw, JSBI.BigInt(lockEnd)), MILLISECONDS_IN_FOUR_YEARS)
  return new TokenAmount(amount.token, newAmount)
}
