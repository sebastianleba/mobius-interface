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

  get_y(i: JSBI, j: JSBI, x: JSBI, xp: JSBI[], amp : JSBI) : JSBI {
    let D = this.calc_D(xp, amp)
    let c = D
    let S = ZERO
    const N_COINS = JSBI.BigInt(this.N_COINS)
    const Ann = JSBI.multiply(amp, N_COINS)

    let _x = ZERO
    for (let _i = 0; _i < N_COINS; _i += 1) {
    if (_i === i) {
        _x = x
    } else if (_i !== j) {
        _x = xp[_i]
    } else {
        continue
    }
    S = JSBI.add(S, _x)
    c = JSBI.divide(JSBI.multiply(c, D), JSBI.multiply(x, N_COINS))
    }
    c = JSBI.divide(JSBI.multiply(c, D), JSBI.multiply(Ann, N_COINS))
    let b = JSBI.add(S, JSBI.divide(D, Ann))
    let y_prev = 0
    let y = D

    for (let _i = 0; _i < 255; _i += 1) {
        y_prev = y
        y  = JSBI.divide(JSBI.add(JSBI.multiply(y, y), c), JSBI.subtract(JSBI.add(JSBI.multiply(2, y), b), D))
        if (y > y_prev) {
            if (y - y_prev <= 1) {
                break
            }
        } else {
            if (y_prev - y <= 1) {
                break
            }
        }
    }
    return y
  }

  get_dy(i: JSBI, j: JSBI, dx: JSBI, xp: JSBI[], amp: JSBI) : JSBI {
    let x : JSBI = JSBI.add(JSBI.divide(JSBI.multiply(dx, this.RATES[i]), this.PRECISION), xp[i])
    let y : JSBI = this.get_y(i, j, x, xp, amp)
    let dy : JSBI = JSBI.divide(JSBI.multiply(JSBI.subtract(xp[j], y), this.PRECISION), this.RATES[j])
    let _fee : JSBI = JSBI.divide(JSBI.divide(this.FEE_INDEX, dy), this.FEE_DENOMINATOR) //TODO: is fee index the right variable?
    return JSBI.subtract(dy, _fee)
  }


  get_dx(i: JSBI, j: JSBI, dy: JSBI, xp: JSBI[], amp: JSBI) : JSBI {
      let y: JSBI = JSBI.subtract(xp[j], JSBI.divide(JSBI.multiply(JSBI.divide(JSBI.multiply(dy, this.FEE_DENOMINATOR), JSBI.subtract(this.FEE_DENOMINATOR, this.FEE_INDEX)), this.RATES[j]), this.PRECISION))
      let x: JSBI = this.get_y(j, i , y, xp, amp)
      let dx: JSBI = JSBI.divide(JSBI.multiply(JSBI.subtract(x, xp[i]), this.PRECISION), this.RATES[i])
    return dx
  }
}
