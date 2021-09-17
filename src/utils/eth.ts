import BN from 'bn.js'
import { fromWei } from 'web3-utils'

import { humanFriendlyNumber } from './number'

export const humanFriendlyWei = (wei: BN | string) => {
  return humanFriendlyNumber(fromWei(wei))
}
