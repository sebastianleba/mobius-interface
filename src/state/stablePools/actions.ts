import { createAction } from '@reduxjs/toolkit'

import { ExternalRewards, GaugeOnlyInfo, PoolOnlyInfo, StableSwapConstants, StableSwapVariable } from './reducer'

export const initPools = createAction<{ pools: StableSwapConstants }>('stablePools/initPools')

export const updateVariableData = createAction<{ address: string; variableData: StableSwapVariable }>(
  'stablePools/updateVariableData'
)

export const updateExternalRewards = createAction<{ pool: string; externalRewards: ExternalRewards[] }>(
  'stablePools/updateExternalRewards'
)

export const updatePools = createAction<{ info: PoolOnlyInfo[] }>('stablePools/updatePools')

export const updateGauges = createAction<{ info: GaugeOnlyInfo[] }>('stablePools/updateGauges')
