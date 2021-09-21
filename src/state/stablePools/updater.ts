import { Interface } from '@ethersproject/abi'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'
import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/hooks'

import GAUGE_V3 from '../../constants/abis/LiquidityGaugeV3.json'
import LP from '../../constants/abis/LPToken.json'
import SWAP from '../../constants/abis/Swap.json'
import { STATIC_POOL_INFO } from '../../constants/StablePools'
import { Erc20, LiquidityGaugeV3, Swap } from '../../generated'
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
import { StableSwapConstants, StableSwapPool } from './reducer'

const SECONDS_PER_BLOCK = JSBI.BigInt('5')
const SwapInterface = new Interface(SWAP.abi)
const lpInterface = new Interface(LP.abi)
const gaugeInterface = new Interface(GAUGE_V3.abi)

const BigIntToJSBI = (num: BigInt | undefined, fallBack = '0') => {
  return JSBI.BigInt(num?.toString() ?? fallBack)
}

export function UpdatePools(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolContract = useStableSwapContract(pools[0].address)
  const lpTokenContract = useLpTokenContract(pools[0].lpToken.address)
  const gaugeContract = useLiquidityGaugeContract('0x1A8938a37093d34581B21bAd2AE7DC1c19150C05')
  const mobiContract = useMobiContract()
  const gaugeController = useGaugeControllerContract()

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    const updatePool = async (
      poolInfo: StableSwapConstants,
      contract: Swap | undefined,
      lpToken: Erc20 | undefined,
      gauge: LiquidityGaugeV3 | undefined
    ) => {
      if (!contract || !lpToken || !gauge) return

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
          fees.reduce((accum, cur, i) =>
            JSBI.add(
              accum,
              JSBI.multiply(cur, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(18 - poolInfo.tokens[i].decimals)))
            )
          )
        )
        const stakingInfo = {}
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
            address: poolInfo.name,
            pool: {
              ...poolInfo,
              virtualPrice,
              balances,
              amp,
              lpTotalSupply,
              lpOwned,
              aPrecise,
              feesGenerated: feesGenerated.raw,
              staking: {
                userStaked: lpStaked,
                totalMobiRate: totalMobiPerBlock,
                pendingMobi,
              },
            },
          })
        )
        // } else {
        //   dispatch(
        //     initPool({
        //       address: poolInfo.name,
        //       pool: {
        //         ...poolInfo,
        //         virtualPrice,
        //         balances,
        //         amp,
        //         lpTotalSupply,
        //         lpOwned,
        //         aPrecise,
        //         feesGenerated,
        //       },
        //     })
        //   )
        // }
      } catch (error) {
        console.error(error)
      }
    }

    pools.forEach((pool, i) => {
      //const swapContract = getContract(pool.address, SwapInterface, library) as any
      updatePool(
        pool,
        poolContract?.attach(pool.address),
        lpTokenContract?.attach(pool.lpToken.address),
        gaugeContract?.attach(pool.gaugeAddress)
      )
    })
  }, [blockNumber, library, account, dispatch])

  return null
}

//export const UpdatePendingMobi

export default function BatchUpdatePools(): null {
  const { library, chainId, account } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: StableSwapConstants[] = STATIC_POOL_INFO[chainId]
  const poolAddresses = pools.map(({ address }) => address)
  const lpTokenAddresses = pools.map(({ lpToken: { address } }) => address)
  const gaugeAddresses = pools.map(({ gaugeAddress }) => gaugeAddress)
  const gaugeController = useGaugeControllerContract()
  const mobiContract = useMobiContract()

  const ampConstants = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getA')
  const balances = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getBalances')
  const virtualPrices = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getVirtualPrice')
  const ampPrecises = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getAPrecise')
  const lpTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, lpInterface, 'totalSupply')
  const lpOwned_multiple = useMultipleContractSingleData(lpTokenAddresses, lpInterface, 'balanceOf', [
    account ?? undefined,
  ])
  const totalStakedAmount_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'working_supply')
  const feesOne = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getAdminBalance', [0])
  const feesTwo = useMultipleContractSingleData(poolAddresses, SwapInterface, 'getAdminBalance', [1])
  const lpStaked_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'balanceOf', [
    account ?? undefined,
  ])
  const pendingMobi_multi = useMultipleContractSingleData(gaugeAddresses, gaugeInterface, 'claimable_tokens', [
    account ?? undefined,
  ])
  const mobiRate: JSBI = BigIntToJSBI(useSingleCallResult(mobiContract, 'rate')?.result?.[0] ?? '0')
  const weights = useSingleContractMultipleData(
    gaugeController,
    'gauge_relative_weight(address)',
    gaugeAddresses.map((a) => [a ?? undefined])
  )

  useMemo(() => {
    pools
      .filter((_, i) => !(totalStakedAmount_multi?.[i]?.loading ?? true))
      .forEach((poolInfo, i) => {
        const virtualPrice: JSBI = BigIntToJSBI((virtualPrices?.[i]?.result?.[0] as BigInt) ?? '0')
        const amp: JSBI = BigIntToJSBI((ampConstants?.[i]?.result?.[0] as BigInt) ?? '0')
        const totalBalances: JSBI[] =
          balances?.[i]?.result?.[0].map((amt: BigInt): JSBI => {
            return BigIntToJSBI(amt)
          }) ?? new Array(poolInfo.tokens.length).fill(JSBI.BigInt('0'))
        const aPrecise: JSBI = BigIntToJSBI((ampPrecises?.[i]?.result?.[0] as BigInt) ?? '1')
        const lpTotalSupply: JSBI = BigIntToJSBI((lpTotalSupplies?.[i]?.result?.[0] as BigInt) ?? '0')
        const lpOwned: JSBI = BigIntToJSBI((lpOwned_multiple?.[i]?.result?.[0] as BigInt) ?? '0')
        const fees: JSBI = JSBI.add(
          JSBI.multiply(
            BigIntToJSBI((feesOne?.[i]?.result?.[0] as BigInt) ?? '0'),
            JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(18 - poolInfo.tokens[0].decimals))
          ),
          JSBI.multiply(
            BigIntToJSBI((feesTwo?.[i]?.result?.[0] as BigInt) ?? '0'),
            JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(18 - poolInfo.tokens[0].decimals))
          )
        )
        const lpStaked: JSBI = BigIntToJSBI((lpStaked_multi?.[i]?.result?.[0] as BigInt) ?? '0')
        const pendingMobi: JSBI = BigIntToJSBI((pendingMobi_multi?.[i]?.result?.[0] as BigInt) ?? '0')
        const weight: JSBI = BigIntToJSBI((weights?.[i]?.result?.[0] as BigInt) ?? '0')
        const totalStakedAmount: JSBI = BigIntToJSBI((totalStakedAmount_multi?.[i]?.result?.[0] as BigInt) ?? '0')

        const totalMobiRate = JSBI.divide(
          JSBI.multiply(mobiRate, weight),
          JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
        )

        const collectedData: StableSwapPool = {
          ...poolInfo,
          virtualPrice,
          balances: totalBalances,
          amp,
          lpTotalSupply,
          lpOwned,
          aPrecise,
          feesGenerated: fees,
          staking: {
            userStaked: lpStaked,
            pendingMobi,
            totalMobiRate,
            totalStakedAmount,
          },
        }
        dispatch(
          initPool({
            address: poolInfo.name,
            pool: collectedData,
          })
        )
      })
  }, [blockNumber, library, account, dispatch])
  return null
}
