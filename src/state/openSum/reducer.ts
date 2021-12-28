import { createReducer } from '@reduxjs/toolkit'
import { JSBI, Token } from '@ubeswap/sdk'
import { NETWORK_CHAIN_ID } from 'connectors'
import { ConstantSum } from 'constants/ConstantSum'
import { WrappedTokenInfo } from 'state/lists/hooks'

import { updateBalances } from './actions'

export type ConstantSumPool = {
  name: string
  address: string
  lpToken: Token
  tokens: [WrappedTokenInfo, WrappedTokenInfo]
  balances?: JSBI[]
}

export interface PoolState {
  readonly pools: ConstantSumPool[]
}

const initialState: PoolState = {
  pools: ConstantSum[NETWORK_CHAIN_ID] ?? [],
}

export default createReducer<PoolState>(initialState, (builder) =>
  builder.addCase(updateBalances, (state, { payload: { balances } }) => {
    balances.forEach((balance, i) => (state.pools[i].balances = balance))
  })
)
