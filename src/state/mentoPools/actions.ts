import { createAction } from '@reduxjs/toolkit'

import { MentoPool, MentoVariable } from './reducer'

export const initPool = createAction<{ address: string; pool: MentoPool }>('stablePools/initPools')

export const updateVariableData = createAction<{ address: string; variableData: MentoVariable }>(
  'stablePools/updateVariableData'
)
