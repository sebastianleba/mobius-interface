import { createAction } from '@reduxjs/toolkit'

import { StakingState } from './reducer'

export const updateStaking = createAction<{ stakingInfo: StakingState }>('staking/update')
export const updateSNX = createAction<{ rewardRate: JSBI; leftToClaim: JSBI }>('staking/updateSNX')
