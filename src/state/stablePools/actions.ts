import { createAction } from '@reduxjs/toolkit'

import { StableSwapPool, StableSwapVariable } from './reducer'

export const initPool = createAction<{ name: string; pool: StableSwapPool }>('stablePools/initPools')

export const updateVariableData = createAction<{ name: string; variableData: StableSwapVariable }>(
  'stablePools/updatVariableData'
)
