// To-Do: Implement Hooks to update Client-Side contract representation
import { ChainId } from '@ubeswap/sdk'

import { STATIC_POOL_INFO } from '../../constants/StablePools'

export const initPools = (chainId: ChainId) => {
  //const dispatch = useDispatch()
  const poolsForChainId = STATIC_POOL_INFO[chainId]

  poolsForChainId.forEach((pool) => {
    console.log(pool)
  })
}
