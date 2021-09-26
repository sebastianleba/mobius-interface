import { JSBI } from '@ubeswap/sdk'
import { MentoPool } from 'state/mentoPools/reducer'

const ZERO = JSBI.BigInt(0)
const ONE = JSBI.BigInt(1)
const TWO = JSBI.BigInt(2)
export class MentoMath {
  public swapFee: JSBI
  public balances: JSBI[]

  constructor({ balances, swapFee }: MentoPool) {
    this.swapFee = ONE
    this.balances = [ZERO, ZERO]
    this.updateInfo(swapFee, balances)
  }

  updateInfo(swapFee: JSBI, balances: JSBI[]) {
    this.swapFee = swapFee
    this.balances = balances
  }

  getAmountIn(outAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI): [JSBI, JSBI] {
    const numerator = JSBI.multiply(JSBI.multiply(outAmount, bucketIn), JSBI.BigInt(1000))
    const denominator = JSBI.multiply(JSBI.subtract(bucketOut, outAmount), JSBI.BigInt(997))
    const amountIn = JSBI.add(JSBI.divide(numerator, denominator), JSBI.BigInt(1))
    return [amountIn, JSBI.BigInt(0)]
  }

  getAmountOut(inAmount: JSBI, bucketIn: JSBI, bucketOut: JSBI): [JSBI, JSBI] {
    const amountInWithFee = JSBI.multiply(inAmount, JSBI.BigInt(997))
    const numerator = JSBI.multiply(amountInWithFee, bucketOut)
    const denominator = JSBI.add(JSBI.multiply(bucketIn, JSBI.BigInt(1000)), amountInWithFee)
    const amountOut = JSBI.divide(numerator, denominator)
    return [amountOut, JSBI.BigInt(0)]
  }
}
