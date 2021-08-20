import { createReducer } from '@reduxjs/toolkit'
import { Token } from '@ubeswap/sdk'
import JSBI from 'jsbi'
import { StableSwapMath } from 'utils/stableSwapMath'

import { initPool, updateVariableData } from './actions'

export type StableSwapVariable = {
  balances: JSBI[]
  A: JSBI[]
}

export type StableSwapMathConstants = {
  rates: JSBI[]
  lendingPrecision: JSBI
  precision: JSBI
  feeDenominator: JSBI
  precisionMul: JSBI[]
  feeIndex: number
}

export type StableSwapConstants = StableSwapMathConstants & {
  tokenAddresses: string[]
  address: string
  lpToken: Token
  fee: JSBI
}

export type StableSwapPool = StableSwapConstants & StableSwapVariable

export interface PoolState {
  readonly pools: {
    [name: string]: {
      pool: StableSwapPool
      math: StableSwapMath
    }
  }
}

const initialState: PoolState = {
  pools: {},
}

export default createReducer<PoolState>(initialState, (builder) =>
  builder
    .addCase(initPool, (state, { payload: { name, pool } }) => {
      const { rates, lendingPrecision, precision, feeDenominator, precisionMul, feeIndex } = pool
      const mathModel = new StableSwapMath({
        rates,
        lendingPrecision,
        precision,
        feeDenominator,
        precisionMul,
        feeIndex,
      })
      return {
        ...state,
        pools: {
          ...state.pools,
          [name]: {
            pool,
            math: mathModel,
          },
        },
      }
    })
    .addCase(updateVariableData, (state, { payload: { name, variableData } }) => {
      const pool = state.pools[name]
      return {
        ...state,
        pools: {
          ...state.pools,
          [name]: {
            ...pool,
            pool: {
              ...pool.pool,
              ...variableData,
            },
          },
        },
      }
    })
)
