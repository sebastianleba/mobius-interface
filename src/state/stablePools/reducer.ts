import { createReducer } from '@reduxjs/toolkit'
import { Fraction, Percent, Token } from '@ubeswap/sdk'
import { Chain, Coins } from 'constants/StablePools'
import JSBI from 'jsbi'
import { StableSwapMath } from 'utils/stableSwapMath'

import { initPool, updateExternalRewards, updateVariableData } from './actions'

export type StableStakingInfo = {
  userStaked: JSBI
  totalStakedAmount: JSBI
  totalMobiRate: JSBI
  pendingMobi: JSBI
}

export type ExternalRewards = {
  token: string
  unclaimed: JSBI
}

export type StableSwapVariable = {
  balances: JSBI[]
  amp: JSBI
  lpTotalSupply: JSBI
  workingLiquidity: JSBI
  lpOwned: JSBI
  virtualPrice: JSBI
  aPrecise: JSBI
  feesGenerated: JSBI
  staking?: StableStakingInfo
  poolWeight: Percent
  effectiveBalance: JSBI
  totalEffectiveBalance: JSBI
  lastUserVote: number
  powerAllocated: number
  futureWeight: JSBI
  externalRewards?: ExternalRewards[]
}

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
  gaugeAddress?: string
  relativeGaugeWeight?: Fraction
  metaPool?: string
  additionalRewards?: string[]
  additionalRewardRate?: string[]
  lastClaim?: Date
  displayChain: Chain
  coin: Coins
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
)
