import { createReducer } from '@reduxjs/toolkit'
import { Fraction, Percent, Token } from '@ubeswap/sdk'
import { Chain, Coins } from 'constants/StablePools'
import JSBI from 'jsbi'
import { StableSwapMath } from 'utils/stableSwapMath'

import { initPool, updateExternalRewards, updateGauges, updatePools, updateVariableData } from './actions'

export type ExternalRewards = {
  token: string
  unclaimed: JSBI
}

export type PoolOnlyInfo = {
  id: string
  volume: {
    day: JSBI
    week: JSBI
  }
  balances: JSBI[]
  amp: JSBI
  virtualPrice: JSBI
  aPrecise: JSBI
  lpTotalSupply: JSBI
  lpOwned: JSBI
}

export type GaugeOnlyInfo = {
  id: string
  userStaked: JSBI
  totalStakedAmount: JSBI
  totalMobiRate: JSBI
  pendingMobi: JSBI
  workingLiquidity: JSBI
  poolWeight: Percent
  effectiveBalance: JSBI
  totalEffectiveBalance: JSBI
  lastUserVote: number
  powerAllocated: number
  futureWeight: JSBI
  externalRewards?: ExternalRewards[]
  gaugeAddress?: string
  relativeGaugeWeight?: Fraction
}

export type StableSwapVariable = PoolOnlyInfo & GaugeOnlyInfo

export type StableSwapMathConstants = {
  totalMobiRate: JSBI
  name: string
  rates: JSBI[]
  lendingPrecision: JSBI
  precision: JSBI
  feeDenominator: JSBI
  precisionMul: JSBI[]
  feeIndex: number
  decimals: JSBI[]
  swapFee: JSBI
}

export type StableSwapConstants = StableSwapMathConstants & {
  tokens: Token[]
  tokenAddresses: string[]
  address: string
  lpToken: Token
  peggedTo: string
  pegComesAfter: boolean | undefined
  displayDecimals: number
  metaPool?: string
  additionalRewards?: string[]
  additionalRewardRate?: string[]
  lastClaim?: Date
  displayChain: Chain
  coin: Coins
  disabled?: boolean
}

export type StableSwapPool = StableSwapConstants & StableSwapVariable
export interface PoolState {
  readonly pools: {
    [address: string]: {
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
    .addCase(initPool, (state, { payload: { address, pool } }) => {
      const mathModel = new StableSwapMath(pool)
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
    .addCase(updateExternalRewards, (state, { payload: { pool, externalRewards } }) => {
      if (!state.pools[pool]) return
      state.pools[pool].pool.externalRewards = externalRewards
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
    .addCase(updatePools, (state, { payload: { info } }) => {
      info.forEach((pool) => {
        const cur = state.pools[pool.id].pool as any as StableSwapPool
        const newPool = { ...cur, ...pool }
        const math = new StableSwapMath(newPool)
        state.pools[pool.id] = {
          pool: newPool,
          math,
        }
      })
    })
    .addCase(updateGauges, (state, { payload: { info } }) => {
      info.forEach((gauge) => {
        const cur = state.pools[gauge.id].pool as any as StableSwapPool
        const newPool = { ...cur, ...gauge }
        state.pools[gauge.id] = {
          pool: newPool,
          math: state.pools[gauge.id].math,
        }
      })
    })
)
