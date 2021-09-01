import { BigintIsh, JSBI } from '@ubeswap/sdk'
import { StableSwapMathConstants, StableSwapVariable } from 'state/stablePools/reducer'

const ZERO = JSBI.BigInt('0')
const ONE = JSBI.BigInt('1')
const TWO = JSBI.BigInt('2')
export class StableSwapMath {
  public readonly RATES: JSBI[]
  public readonly LENDING_PRECISION: JSBI
  public readonly PRECISION: JSBI
  public readonly FEE_DENOMINATOR: JSBI
  public readonly PRECISION_MUL: JSBI[]
  public readonly N_COINS: number
  public readonly FEE_INDEX: number
  public readonly DECIMALS: JSBI[]
  public readonly POOL_PRECISION_DECIMALS = JSBI.BigInt('18')
  public readonly tokenPrecisionMultipliers: JSBI[]

  public lpTotalSupply: JSBI
  public swapFee: JSBI
  public currentWithdrawFee: JSBI
  public balances: JSBI[]
  public amp: JSBI
  public D: JSBI | undefined
  public xp: JSBI[] | undefined

  constructor({
    rates,
    lendingPrecision,
    precision,
    feeDenominator,
    precisionMul,
    feeIndex,
    decimals,
    amp,
    balances,
    lpTotalSupply,
    swapFee,
  }: StableSwapMathConstants & StableSwapVariable) {
    this.RATES = rates
    this.LENDING_PRECISION = lendingPrecision
    this.PRECISION = precision
    this.FEE_DENOMINATOR = feeDenominator
    this.PRECISION_MUL = precisionMul
    this.N_COINS = rates.length
    this.FEE_INDEX = feeIndex
    this.DECIMALS = decimals
    const tokenPrecisionMultipliers = decimals.map((deci) =>
      JSBI.exponentiate(JSBI.BigInt('10'), JSBI.subtract(this.POOL_PRECISION_DECIMALS, deci))
    )

    this.tokenPrecisionMultipliers = tokenPrecisionMultipliers

    this.currentWithdrawFee = ZERO
    this.swapFee = ONE
    this.amp = ONE
    this.balances = Array(this.N_COINS).fill(ZERO)
    this.lpTotalSupply = ONE
    this.updateInfo(swapFee, amp, balances, lpTotalSupply)
  }

  updateInfo(swapFee: JSBI, amp: JSBI, balances: JSBI[], lpTotalSupply: JSBI) {
    this.swapFee = swapFee
    this.amp = amp
    this.balances = balances
    this.lpTotalSupply = lpTotalSupply
  }

  calc_xp_mem(balances: BigintIsh[]): JSBI[] {
    if (this.xp) return this.xp
    const balancesCasted = balances.map((b) => JSBI.BigInt(b.toString()))
    const result = this.tokenPrecisionMultipliers.slice()
    const xp = result.map((r, i) => JSBI.multiply(r, balancesCasted[i]))
    this.xp = xp
    return xp
  }

  getD(xp: JSBI[], a: JSBI): JSBI {
    const numTokens = this.N_COINS
    const s = xp.reduce((accum, cur) => JSBI.add(accum, cur))
    if (JSBI.equal(s, ZERO)) return ZERO
    // To do - finish implementing
    return ZERO
  }

  calc_xp(): JSBI[] {
    return this.calc_xp_mem(this.balances)
  }

  calc_D_xp(xp: JSBI[], amp: JSBI): JSBI {
    if (this.D) return this.D
    const S = xp.reduce((accum, cur) => JSBI.add(accum, cur))
    const N_COINS = JSBI.BigInt(this.N_COINS)
    let Dprev = ZERO
    let D = JSBI.BigInt(S.toString())
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
    this.D = D
    return D
  }

  calc_D(): JSBI {
    return this.calc_D_xp(this.calc_xp_mem(this.balances), this.amp)
  }

  get_y(i: number, j: number, x: JSBI, xp: JSBI[]): JSBI {
    const D = this.calc_D()
    let c = D
    let S = ZERO
    const N_COINS = JSBI.BigInt(this.N_COINS)
    const Ann = JSBI.multiply(this.amp, N_COINS)

    let _x = ZERO
    for (let _i = 0; _i < this.N_COINS; _i += 1) {
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
    const b = JSBI.add(S, JSBI.divide(D, Ann))
    let y_prev = ZERO
    let y = D

    for (let _i = 0; _i < 255; _i += 1) {
      y_prev = y
      y = JSBI.divide(JSBI.add(JSBI.multiply(y, y), c), JSBI.subtract(JSBI.add(JSBI.multiply(TWO, y), b), D))
      if (JSBI.greaterThan(y, y_prev)) {
        if (JSBI.lessThanOrEqual(JSBI.subtract(y, y_prev), ONE)) {
          break
        }
      } else {
        if (JSBI.lessThanOrEqual(JSBI.subtract(y_prev, y), ONE)) {
          break
        }
      }
    }
    return y
  }

  get_dy(i: number, j: number, dx: JSBI, xp: JSBI[]): JSBI {
    const x: JSBI = JSBI.add(JSBI.divide(JSBI.multiply(dx, this.RATES[i]), this.PRECISION), xp[i])
    const y: JSBI = this.get_y(i, j, x, xp)
    const dy: JSBI = JSBI.divide(JSBI.multiply(JSBI.subtract(xp[j], y), this.PRECISION), this.RATES[j])
    const _fee: JSBI = JSBI.divide(JSBI.divide(JSBI.BigInt(this.FEE_INDEX.toString()), dy), this.FEE_DENOMINATOR) //TODO: is fee index the right variable?
    return JSBI.subtract(dy, _fee)
  }

  // getY(indexFrom: number, indexTo: number, x: JSBI, xp: JSBI[], this.amp: JSBI): JSBI {
  //   const d =
  // }

  calculateSwap(indexFrom: number, indexTo: number, dx: JSBI, xp: JSBI[]): [JSBI, JSBI] {
    const x = JSBI.add(xp[indexFrom], JSBI.multiply(this.tokenPrecisionMultipliers[indexFrom], dx))
    const y = this.get_y(indexFrom, indexTo, x, xp)
    let dy = JSBI.subtract(JSBI.subtract(xp[indexTo], y), ONE)
    const dyFee = JSBI.divide(JSBI.multiply(dy, this.swapFee), this.FEE_DENOMINATOR)
    dy = JSBI.divide(JSBI.subtract(dy, dyFee), this.tokenPrecisionMultipliers[indexTo])
    return [dy, dyFee]
  }

  calculateRemoveLiquidity(amount: JSBI, lpTotalSupply: JSBI) {
    const feeAdjustedAmount = JSBI.divide(
      JSBI.multiply(JSBI.subtract(this.FEE_DENOMINATOR, this.currentWithdrawFee), amount),
      this.FEE_DENOMINATOR
    )
    const amounts = this.balances.map((bal) => JSBI.divide(JSBI.multiply(bal, feeAdjustedAmount), lpTotalSupply))
    return amounts
  }

  get_dx(i: number, j: number, dy: JSBI, xp: JSBI[]): JSBI {
    const y: JSBI = JSBI.subtract(
      xp[j],
      JSBI.divide(
        JSBI.multiply(
          JSBI.divide(
            JSBI.multiply(dy, this.FEE_DENOMINATOR),
            JSBI.subtract(this.FEE_DENOMINATOR, JSBI.BigInt(this.FEE_INDEX.toString()))
          ),
          this.RATES[j]
        ),
        this.PRECISION
      )
    )
    const x: JSBI = this.get_y(j, i, y, xp)
    const dx: JSBI = JSBI.divide(JSBI.multiply(JSBI.subtract(x, xp[i]), this.PRECISION), this.RATES[i])
    return dx
  }
}
