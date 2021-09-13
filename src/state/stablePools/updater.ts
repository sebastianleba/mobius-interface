import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { MOBIUS_STRIP_ADDRESS, STATIC_POOL_INFO } from '../../constants/StablePools'
import { Erc20, Swap } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import {
  useGaugeControllerContract,
  useLiquidityGaugeContract,
  useLpTokenContract,
  useMobiContract,
  useMobiusStripContract,
  useStableSwapContract,
} from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { StableSwapConstants } from './reducer'

const SECONDS_PER_BLOCK = JSBI.BigInt('5')

export function UpdatePools(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useCurrentBlockTimestamp()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolContract = useStableSwapContract(pools[0].address)
  const lpTokenContract = useLpTokenContract(pools[0].lpToken.address)
  const mobiusStrip = useMobiusStripContract(MOBIUS_STRIP_ADDRESS[chainId])
  let gauge = useLiquidityGaugeContract('0xC0350e1f0531c43d00Ef22571781acA25360E672')
  const mobiContract = useMobiContract()
  const gaugeController = useGaugeControllerContract()

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
      if (poolInfo.gaugeAddress && poolInfo.relativeGaugeWeight) {
        gauge = gauge?.attach(poolInfo.gaugeAddress) ?? gauge
        const lpStaked = account ? JSBI.BigInt(((await gauge?.balanceOf(account)) ?? '0').toString()) : undefined
        const totalMobiRate = JSBI.BigInt(((await mobiContract?.rate()) ?? '10').toString())
        const weight = JSBI.BigInt(
          (await gaugeController?.['gauge_relative_weight(address)'](poolInfo.gaugeAddress))?.toString() ?? '0'
        )
        const pendingMobi = account
          ? JSBI.BigInt(((await gauge?.claimable_tokens(account)) ?? '0').toString())
          : undefined

        const totalMobiPerBlock = JSBI.divide(
          JSBI.multiply(totalMobiRate, weight),
          JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
        )
        // console.log({
        //   totalMobiRate: totalMobiRate.toString(),
        //   totalMobiPerBlock: totalMobiPerBlock.toString(),
        //   weight,
        //   val: JSBI.divide(weight, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))).toString(),
        // })
        stakingInfo = {
          staking: {
            userStaked: lpStaked,
            totalMobiRate: JSBI.divide(totalMobiPerBlock, SECONDS_PER_BLOCK),
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
