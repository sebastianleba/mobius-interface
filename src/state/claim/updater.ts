import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { VestingAddresses } from '../../constants/StablePools'
import { VestingEscrow } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import { useVestingContract } from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { update } from './actions'
import { VestType } from './reducer'

export default function UpdateClaim(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const claimContract = useVestingContract()

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updateClaim = async (vesting: VestingEscrow | undefined, type: VestType) => {
      if (!vesting || !account) return
      const initialLocked = JSBI.BigInt(await vesting?.['initial_locked'](account))
      const unclaimed = JSBI.BigInt(await vesting?.['balanceOf'](account))
      const claimed = JSBI.subtract(
        JSBI.subtract(initialLocked, JSBI.BigInt(await vesting?.['lockedOf'](account))),
        unclaimed
      )
      console.log()
      dispatch(
        update({
          type,
          claim: {
            allocatedAmount: initialLocked,
            claimedAmount: claimed,
            unclaimedAmount: unclaimed,
          },
        })
      )
    }
    Object.entries(VestingAddresses).forEach(([type, addresses]) => {
      const vestingContract = claimContract?.attach(addresses[chainId])
      updateClaim(vestingContract, parseInt(type))
    })
  }, [library, blockNumber, claimContract, account, dispatch])

  return null
}
