import { JSBI } from '@ubeswap/sdk'
import { useActiveContractKit } from 'hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useSingleCallResult } from 'state/multicall/hooks'

import { useGaugeControllerContract, useVotingEscrowContract } from '../../hooks/useContract'
import { updateStaking } from './actions'

export default function StakingUpdater() {
  const dispatch = useDispatch<AppDispatch>()
  const votingEscrow = useVotingEscrowContract()
  const controller = useGaugeControllerContract()
  const { account } = useActiveContractKit()

  const votingPower = useSingleCallResult(votingEscrow, 'balanceOf(address)', [account ?? undefined])
  const totalVotingPower = useSingleCallResult(votingEscrow, 'totalSupply()')
  const locked = useSingleCallResult(votingEscrow, 'locked', [account ?? undefined])
  const allocatedPower = useSingleCallResult(controller, 'vote_user_power', [account ?? undefined])
  const totalWeight = useSingleCallResult(controller, 'get_total_weight')
  dispatch(
    updateStaking({
      stakingInfo: {
        votingPower: JSBI.BigInt(votingPower?.result?.[0] ?? '0'),
        totalVotingPower: JSBI.BigInt(totalVotingPower?.result?.[0] ?? '0'),
        locked: {
          amount: JSBI.BigInt(locked?.result?.amount ?? '0'),
          end: parseInt(locked?.result?.end.toString()) * 1000, // Need unix in milliseconds
        },
        voteUserPower: JSBI.BigInt(allocatedPower?.result?.[0] ?? '0'),
        totalWeight: JSBI.BigInt(totalWeight?.result?.[0] ?? '0'),
      },
    })
  )
  return null
}
