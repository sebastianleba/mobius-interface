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
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolContract = useStableSwapContract(pools[0].address)
  const lpTokenContract = useLpTokenContract(pools[0].lpToken.address)

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    console.log('Update Pools')
    const updatePool = async (
      poolInfo: StableSwapConstants,
      contract: Swap | undefined,
      lpToken: Erc20 | undefined
    ) => {
      if (!contract || !lpToken) return
      const amp = JSBI.BigInt(await contract.getA({ gasLimit: 350000 }))
      const balances = (await contract.getBalances({ gasLimit: 350000 })).map((num) => JSBI.BigInt(num))
      //const swapFee = JSBI.BigInt(await contract.getSwapFee({ gasLimit: 350000 }))
      const virtualPrice = JSBI.BigInt(await contract.getVirtualPrice({ gasLimit: 350000 }))
      const aPrecise = JSBI.BigInt(await contract.getAPrecise())

      const lpTotalSupply = JSBI.BigInt(await lpToken.totalSupply({ gasLimit: 350000 }))
      const lpOwned = JSBI.BigInt(!account ? '0' : await lpToken.balanceOf(account))

      dispatch(
        initPool({
          name: poolInfo.name,
          pool: { ...poolInfo, virtualPrice, balances, amp, lpTotalSupply, lpOwned, aPrecise },
        })
      )
    }

    pools.forEach((pool, i) => {
      //const swapContract = getContract(pool.address, SWAP.abi, library) as any
      updatePool(pool, poolContract?.attach(pool.address), lpTokenContract?.attach(pool.lpToken.address))
    })
  }, [pools, library, blockNumber])

  return null
}
