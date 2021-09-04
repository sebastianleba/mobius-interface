import { TokenAmount } from '@ubeswap/sdk'
import { useActiveWeb3React } from 'hooks/index'
import { StablePoolInfo } from 'state/stablePools/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
//import { StablePoolInfo, StakingInfo } from 'state/stake/hooks'

interface IStakingPoolValue {
  totalStaked?: TokenAmount
  userStaked?: TokenAmount
}

export const useStakingPoolValue = (stakingInfo?: StablePoolInfo | null): IStakingPoolValue => {
  const { chainId } = useActiveWeb3React()
  const totalStaked = useTokenBalance(stakingInfo?.poolAddress, stakingInfo?.lpToken)
  const userStaked = stakingInfo?.stakedAmount

  return {
    totalStaked,
    userStaked,
  }
}
