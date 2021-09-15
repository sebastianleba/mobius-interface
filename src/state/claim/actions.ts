import { createAction } from '@reduxjs/toolkit'

import { Claim } from './reducer'

export const update = createAction<{ claim: Claim }>('claim/update')
