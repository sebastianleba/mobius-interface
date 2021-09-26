import { StableToken } from '@celo/contractkit'
import { createReducer } from '@reduxjs/toolkit'
import { Token } from '@ubeswap/sdk'
import JSBI from 'jsbi'
import { MentoMath } from 'utils/mentoMath'

import { initPool, updateVariableData } from './actions'

export type MentoVariable = {
  balances: JSBI[]
}

export type MentoMathConstants = {
  address: string
  swapFee: JSBI
}

export type MentoConstants = MentoMathConstants & {
  tokens: Token[]
  tokenAddresses: string[]
  address: string
  stable: StableToken
}

export type MentoPool = MentoConstants & MentoVariable

export interface PoolState {
  readonly pools: {
    [address: string]: {
      pool: MentoPool
      math: MentoMath
    }
  }
}

const initialState: PoolState = {
  pools: {},
}

export default createReducer<PoolState>(initialState, (builder) =>
  builder
    .addCase(initPool, (state, { payload: { address, pool } }) => {
      const mathModel = new MentoMath(pool)
      return {
        ...state,
        pools: {
          ...state.pools,
          [address]: {
            pool,
            math: mathModel,
          },
        },
      }
    })
    .addCase(updateVariableData, (state, { payload: { address, variableData } }) => {
      const pool = state.pools[address]
      return {
        ...state,
        pools: {
          ...state.pools,
          [address]: {
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
