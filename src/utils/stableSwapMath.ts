import { BigintIsh, JSBI } from '@ubeswap/sdk'
import { StableSwapMathConstants } from 'state/stablePools/reducer'

const ZERO = JSBI.BigInt('0')

export class StableSwapMath {
  public readonly RATES: JSBI[]
  public readonly LENDING_PRECISION: JSBI
  public readonly PRECISION: JSBI
  public readonly FEE_DENOMINATOR: JSBI
  public readonly PRECISION_MUL: JSBI[]
  public readonly N_COINS: number
  public readonly FEE_INDEX: number

  constructor({ rates, lendingPrecision, precision, feeDenominator, precisionMul, feeIndex }: StableSwapMathConstants) {
    this.RATES = rates
    this.LENDING_PRECISION = lendingPrecision
    this.PRECISION = precision
    this.FEE_DENOMINATOR = feeDenominator
    this.PRECISION_MUL = precisionMul
    this.N_COINS = rates.length
    this.FEE_INDEX = feeIndex
  }

  calc_xp_mem(balances: BigintIsh[]): JSBI[] {
    const balancesCasted = balances.map((b) => JSBI.BigInt(b.toString))
    const result = this.RATES.slice()
    return result.map((r, i) => JSBI.divide(JSBI.multiply(r, balancesCasted[i]), this.PRECISION))
  }

  calc_D(xp: JSBI[], amp: JSBI): JSBI {
    const S = xp.reduce((accum, cur) => JSBI.add(accum, cur))
    const N_COINS = JSBI.BigInt(this.N_COINS)
    let Dprev = ZERO
    let D = JSBI.BigInt(S.toString)
    const Ann = JSBI.multiply(amp, N_COINS)

    for (let i = 0; i < 255; i++) {
      const D_P = xp.reduce((accum, cur) => JSBI.divide(JSBI.multiply(accum, D), JSBI.multiply(cur, N_COINS)), D)
      Dprev = D
      const left = JSBI.multiply(JSBI.add(JSBI.multiply(Ann, S), JSBI.multiply(D_P, N_COINS)), D)

      const right = JSBI.ADD(
        JSBI.multiply(JSBI.subtract(Ann, JSBI.BigInt('1')), D),
        JSBI.multiply(JSBI.add(N_COINS, JSBI.BigInt('1')), D_P)
      )

      D = JSBI.divide(left, right)
    }
    return D
  }

  calc_D_using_balance(balances: BigintIsh[], amp: JSBI): JSBI {
    return this.calc_D(this.calc_xp_mem(balances), amp)
  }
}
