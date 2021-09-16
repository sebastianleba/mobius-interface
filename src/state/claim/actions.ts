import { createAction } from '@reduxjs/toolkit'

import { Claim, VestType } from './reducer'

export const update = createAction<{ type: VestType; claim: Claim }>('claim/update')
