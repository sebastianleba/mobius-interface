import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'

import { STATIC_POOL_INFO } from '../../constants/StablePools'
import { Erc20, Swap } from '../../generated'
import { useActiveWeb3React } from '../../hooks'
import {
  useGaugeControllerContract,
  useLiquidityGaugeContract,
  useLpTokenContract,
  useMobiContract,
  useStableSwapContract,
} from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { StableSwapConstants } from './reducer'

const SECONDS_PER_BLOCK = JSBI.BigInt('5')

export default function UpdatePools(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolContract = useStableSwapContract(pools[0].address)
  const lpTokenContract = useLpTokenContract(pools[0].lpToken.address)
  let gauge = useLiquidityGaugeContract('0x1A8938a37093d34581B21bAd2AE7DC1c19150C05')
  const mobiContract = useMobiContract()
  const gaugeController = useGaugeControllerContract()

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updatePool = async (
      poolInfo: StableSwapConstants,
      contract: Swap | undefined,
      lpToken: Erc20 | undefined
    ) => {
      if (!contract || !lpToken) return
      try {
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
        const stakingInfo = {}
        if (poolInfo.gaugeAddress) {
          gauge = (await gauge?.attach(poolInfo.gaugeAddress)) ?? gauge
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

          dispatch(
            initPool({
              address: poolInfo.address,
              pool: {
                ...poolInfo,
                virtualPrice,
                balances,
                amp,
                lpTotalSupply,
                lpOwned,
                aPrecise,
                feesGenerated,
                staking: {
                  userStaked: lpStaked,
                  totalMobiRate: totalMobiPerBlock,
                  pendingMobi,
                },
              },
            })
          )
        } else {
          dispatch(
            initPool({
              address: poolInfo.address,
              pool: {
                ...poolInfo,
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
      } catch (error) {
        console.error(error)
      }
    }

    pools.forEach((pool, i) => {
      //const swapContract = getContract(pool.address, SWAP.abi, library) as any
      updatePool(pool, poolContract?.attach(pool.address), lpTokenContract?.attach(pool.lpToken.address))
    })
  }, [blockNumber, library, account])

  return null
}

//export const UpdatePendingMobi
