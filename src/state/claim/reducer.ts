import { createReducer } from '@reduxjs/toolkit'
import JSBI from 'jsbi'

import { update } from './actions'

export type Claim = {
  allocatedAmount: JSBI
  claimAmount: JSBI
  unclaimedAmount: JSBI
}

export interface ClaimState {
  claim: Claim
}

const initialState: ClaimState = {
  claim: {
    allocatedAmount: JSBI.BigInt(0),
    claimAmount: JSBI.BigInt(0),
    unclaimedAmount: JSBI.BigInt(0),
  },
}

export default createReducer<ClaimState>(initialState, (builder) =>
  builder.addCase(update, (state, { payload: { claim } }) => {
    return {
      ...state,
      claim: claim,
    }
  })
)
