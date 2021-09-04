import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { MOBIUS_STRIP_ADDRESS, STATIC_POOL_INFO } from '../../constants/StablePools'
import { Erc20, Swap } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import { useLpTokenContract, useMobiusStripContract, useStableSwapContract } from '../../hooks/useContract'
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
  const mobiusStrip = useMobiusStripContract(MOBIUS_STRIP_ADDRESS[chainId])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updatePool = async (
      poolInfo: StableSwapConstants,
      contract: Swap | undefined,
      lpToken: Erc20 | undefined
    ) => {
      if (!contract || !lpToken || !mobiusStrip) return
      const amp = JSBI.BigInt(await contract.getA({ gasLimit: 350000 }))
      const balances = (await contract.getBalances({ gasLimit: 350000 })).map((num) => JSBI.BigInt(num))
      //const swapFee = JSBI.BigInt(await contract.getSwapFee({ gasLimit: 350000 }))
      const virtualPrice = JSBI.BigInt(await contract.getVirtualPrice({ gasLimit: 350000 }))
      const aPrecise = JSBI.BigInt(await contract.getAPrecise())

      const lpTotalSupply = JSBI.BigInt(await lpToken.totalSupply({ gasLimit: 350000 }))
      const lpOwned = JSBI.BigInt(!account ? '0' : await lpToken.balanceOf(account))

      const fees = await Promise.all(
        poolInfo.tokens.map(async (_, i) => JSBI.BigInt((await contract.getAdminBalance(i)).toString()))
      )

      const feesGenerated = new TokenAmount(
        poolInfo.tokens[0],
        fees.reduce((accum, cur) => JSBI.add(accum, JSBI.multiply(cur, JSBI.BigInt('10'))))
      )
      let stakingInfo = {}
      if (poolInfo.mobiusStripIndex !== undefined) {
        const lpStaked = await mobiusStrip?.getAmountStaked(poolInfo.mobiusStripIndex, account)
        console.log({ lpStaked: lpStaked.toString() })
        const allocationPoints = JSBI.BigInt((await mobiusStrip.poolInfo(poolInfo.mobiusStripIndex))[1].toString())
        const totalMobiRate = JSBI.BigInt((await mobiusStrip.mobiPerBlock()).toString())
        const pendingMobi = JSBI.BigInt((await mobiusStrip.pendingMobi(poolInfo.mobiusStripIndex, account)).toString())
        stakingInfo = {
          staking: {
            userStaked: JSBI.BigInt(lpStaked.toString()),
            totalMobiRate: JSBI.divide(totalMobiRate, allocationPoints),
            pendingMobi,
          },
        }
      }

      dispatch(
        initPool({
          name: poolInfo.name,
          pool: {
            ...poolInfo,
            ...stakingInfo,
            virtualPrice,
            balances,
            amp,
            lpTotalSupply,
            lpOwned,
            aPrecise,
            feesGenerated,
          },
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
