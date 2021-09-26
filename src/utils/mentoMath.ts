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
}
