import { createAction } from '@reduxjs/toolkit'

import { StableSwapPool, StableSwapVariable } from './reducer'

export const initPool = createAction<{ address: string; pool: StableSwapPool }>('stablePools/initPools')

export const updateVariableData = createAction<{ address: string; variableData: StableSwapVariable }>(
  'stablePools/updateVariableData'
)
