import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Contract } from 'web3-eth-contract'

import LP_TOKEN from '../../constants/abis/LPToken.json'
import SWAP from '../../constants/abis/Swap.json'
import { STATIC_POOL_INFO } from '../../constants/StablePools'
import { Swap } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { StableSwapConstants } from './reducer'

export default function UpdatePools(): null {
  const { library, chainId } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]

  const updatePool = async (poolInfo: StableSwapConstants, contract: Swap) => {
    const amp = JSBI.BigInt(await contract.getA())
    const balances = (await contract.getBalances()).map((num) => JSBI.BigInt(num))
    const swapFee = JSBI.BigInt(await contract.getSwapFee())

    const lpTokenAddress = await contract.getLpToken()
    const lpToken = new Contract(LP_TOKEN.abi, lpTokenAddress, library) as any
    const lpTotalSupply = await lpToken.totalSupply()

    dispatch(initPool({ name: poolInfo.name, pool: { ...poolInfo, balances, amp, lpTotalSupply, swapFee } }))
  }

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    pools.forEach((pool) => {
      const swapContract = new Contract(SWAP.abi, pool.address, library) as any
      updatePool(pool, swapContract)
    })
  }, [pools, library, blockNumber])

  return null
}
