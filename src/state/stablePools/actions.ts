import { createAction } from '@reduxjs/toolkit'

import { ExternalRewards, GaugeOnlyInfo, PoolOnlyInfo, StableSwapPool, StableSwapVariable } from './reducer'

export const initPool = createAction<{ address: string; pool: StableSwapPool }>('stablePools/initPools')

export const updateVariableData = createAction<{ address: string; variableData: StableSwapVariable }>(
  'stablePools/updateVariableData'
)

export const updateExternalRewards = createAction<{ pool: string; externalRewards: ExternalRewards[] }>(
  'stablePools/updateExternalRewards'
)

export const updatePools = createAction<{ info: PoolOnlyInfo[] }>('stablePools/updatePools')

export const updateGauges = createAction<{ info: GaugeOnlyInfo[] }>('stablePools/updateGauges')
