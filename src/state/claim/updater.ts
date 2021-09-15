import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { VestingEscrow } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import { useVestingContract } from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { update } from './actions'

export function UpdateClaim(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const claimContract = useVestingContract()

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updateClaim = async (vesting: VestingEscrow | undefined) => {
      if (!vesting) return
      const initialLocked = JSBI.BigInt(await vesting.initial_locked(account))
      const unclaimed = JSBI.BigInt(await vesting.balanceOf(account))
      const claimed = JSBI.subtract(
        JSBI.subtract(initialLocked, JSBI.BigInt(await vesting.lockedOf(account))),
        unclaimed
      )

      dispatch(
        update({
          claim: {
            allocatedAmount: initialLocked,
            claimedAmount: claimed,
            unclaimedAmount: unclaimed,
          },
        })
      )
    }

    updateClaim(claimContract)
  }, [library, blockNumber, claimContract, account, dispatch])

  return null
}
