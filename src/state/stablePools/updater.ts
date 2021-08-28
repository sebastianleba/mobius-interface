import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { STATIC_POOL_INFO } from '../../constants/StablePools'
import { Erc20, Swap } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import { useLpTokenContract, useStableSwapContract } from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { StableSwapConstants } from './reducer'

export function UpdatePools(): null {
  const { library, chainId } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolContract = useStableSwapContract(pools[0].address)
  const lpTokenContract = useLpTokenContract(pools[0].lpToken.address)

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updatePool = async (
      poolInfo: StableSwapConstants,
      contract: Swap | undefined,
      lpToken: Erc20 | undefined
    ) => {
      if (!contract || !lpToken) return
      const amp = JSBI.BigInt(await contract.getA())
      const balances = (await contract.getBalances()).map((num) => JSBI.BigInt(num))
      const swapFee = JSBI.BigInt(await contract.getSwapFee())

      const lpTotalSupply = JSBI.BigInt(await lpToken.totalSupply())

      dispatch(initPool({ name: poolInfo.name, pool: { ...poolInfo, balances, amp, lpTotalSupply, swapFee } }))
    }

    pools.forEach((pool, i) => {
      //const swapContract = getContract(pool.address, SWAP.abi, library) as any
      updatePool(pool, poolContract?.attach(pool.address), lpTokenContract?.attach(pool.lpToken.address))
    })
  }, [pools, library, blockNumber])

  return null
}
