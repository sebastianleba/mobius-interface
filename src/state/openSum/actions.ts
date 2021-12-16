import { createAction } from '@reduxjs/toolkit'
import { JSBI } from '@ubeswap/sdk'

export const updateBalances = createAction<{ balances: JSBI[][] }>('openSum/updateBalances')
