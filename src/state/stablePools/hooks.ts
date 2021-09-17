// To-Do: Implement Hooks to update Client-Side contract representation
import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useStableSwapContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTokenBalance } from 'state/wallet/hooks'

import { StableSwapMath } from '../../utils/stableSwapMath'
import { AppState } from '..'
import { StableSwapPool } from './reducer'

export interface StablePoolInfo {
  readonly name: string
  readonly poolAddress?: string
  readonly stakingToken?: Token
  readonly lpToken?: Token
  readonly tokens: readonly Token[]
  readonly amountDeposited?: TokenAmount
  readonly totalDeposited: TokenAmount
  readonly apr?: TokenAmount
  readonly totalStakedAmount?: TokenAmount
  readonly stakedAmount: TokenAmount
  readonly totalVolume?: TokenAmount
  readonly peggedTo: string
  readonly virtualPrice: TokenAmount
  readonly priceOfStaked: TokenAmount
  readonly balances: TokenAmount[]
  readonly pegComesAfter: boolean | undefined
  readonly feesGenerated: TokenAmount
  readonly mobiRate: JSBI | undefined
  readonly pendingMobi: JSBI | undefined
  readonly gaugeAddress?: string
}

export function useCurrentPool(tok1: string, tok2: string): readonly [StableSwapPool] {
  const pools = useSelector<AppState, StableSwapPool[]>((state) =>
    Object.values(state.stablePools.pools)
      .map(({ pool }) => pool)
      .filter(({ tokenAddresses }) => {
        return tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2)
      })
  )
  return [pools.length > 0 ? pools[0] : null]
}

export function usePools(): readonly StableSwapPool[] {
  const pools = useSelector<AppState, StableSwapPool[]>((state) =>
    Object.values(state.stablePools.pools).map(({ pool }) => pool)
  )
  return pools
}

const tokenAmountScaled = (token: Token, amount: JSBI): TokenAmount =>
  new TokenAmount(token, JSBI.divide(amount, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(token.decimals))))

const getPoolInfo = (pool: StableSwapPool): StablePoolInfo => ({
  name: pool.name,
  poolAddress: pool.address,
  lpToken: pool.lpToken,
  tokens: pool.tokens,
  amountDeposited: new TokenAmount(pool.lpToken, pool.lpOwned),
  totalDeposited: new TokenAmount(pool.lpToken, pool.lpTotalSupply),
  stakedAmount: new TokenAmount(pool.lpToken, pool.staking?.userStaked || JSBI.BigInt('0')),
  apr: new TokenAmount(pool.lpToken, JSBI.BigInt('100000000000000000')),
  peggedTo: pool.peggedTo,
  virtualPrice: tokenAmountScaled(pool.lpToken, JSBI.multiply(pool.virtualPrice, pool.lpTotalSupply)),
  priceOfStaked: tokenAmountScaled(
    pool.lpToken,
    JSBI.multiply(pool.virtualPrice, JSBI.add(pool.lpOwned, pool.staking?.userStaked || JSBI.BigInt('0')))
  ),
  balances: pool.tokens.map((token, i) => new TokenAmount(token, pool.balances[i])),
  pegComesAfter: pool.pegComesAfter,
  feesGenerated: pool.feesGenerated,
  mobiRate: pool.staking?.totalMobiRate,
  pendingMobi: pool.staking?.pendingMobi,
  gaugeAddress: pool.gaugeAddress,
})

export function useStablePoolInfoByName(name: string): StablePoolInfo | undefined {
  const { chainId } = useActiveWeb3React()
  console.log('useStablePoolInfoByName')
  const pool = useSelector<AppState, StableSwapPool>((state) => state.stablePools.pools[name]?.pool)
  const totalStakedAmount = useTokenBalance(pool.gaugeAddress, pool.lpToken)
  return !pool ? undefined : { ...getPoolInfo(pool), totalStakedAmount }
}

export function useStablePoolInfo(): readonly StablePoolInfo[] {
  console.log('useStablePoolInfo')
  const pools = usePools()
  return pools.map((pool) => getPoolInfo(pool))
}

export function useExpectedTokens(pool: StablePoolInfo, lpAmount: TokenAmount): TokenAmount[] {
  const contract = useStableSwapContract(pool.poolAddress)
  const { tokens } = pool
  const { account } = useActiveWeb3React()
  const [expectedOut, setExpectedOut] = useState<TokenAmount[]>(
    tokens.map((token) => new TokenAmount(token, JSBI.BigInt('0')))
  )
  useEffect(() => {
    const updateData = async () => {
      try {
        const newTokenAmounts = await contract?.calculateRemoveLiquidity(account, lpAmount.raw.toString())
        setExpectedOut(tokens.map((token, i) => new TokenAmount(token, JSBI.BigInt(newTokenAmounts[i].toString()))))
      } catch (e) {
        console.error(e)
        setExpectedOut(tokens.map((token, i) => new TokenAmount(token, JSBI.BigInt('0'))))
      }
    }
    lpAmount && lpAmount.raw && updateData()
  }, [account, pool, lpAmount])
  return expectedOut
}

export function useExpectedLpTokens(pool: StablePoolInfo, tokenAmounts: TokenAmount[], isDeposit = true): TokenAmount {
  const contract = useStableSwapContract(pool.poolAddress)
  const { account } = useActiveWeb3React()
  const [expectedOut, setExpectedOut] = useState(new TokenAmount(pool.lpToken, JSBI.BigInt('0')))
  useEffect(() => {
    const updateData = async () => {
      try {
        const newExpected = await contract?.calculateTokenAmount(
          account,
          tokenAmounts.map((t) => BigInt(t.raw.toString())),
          isDeposit,
          { gasLimit: 350000 }
        )
        setExpectedOut(new TokenAmount(pool.lpToken, JSBI.BigInt(newExpected?.toString() || '0')))
      } catch (e) {
        console.error(e)
      }
    }

    const validInputs = tokenAmounts.reduce((accum, cur) => accum && !!cur && !!cur.raw, true)
    if (!validInputs) {
      return
    }
    if (!pool.totalDeposited || pool.totalDeposited.equalTo('0')) {
      const expectedOut = tokenAmounts.reduce((accum, cur) => JSBI.add(accum, cur.raw), JSBI.BigInt('0'))
      setExpectedOut(new TokenAmount(pool.lpToken, expectedOut))
    } else {
      updateData()
    }
  }, [account, pool, tokenAmounts])
  return expectedOut
}

export function useMathUtil(pool: StableSwapPool | string): StableSwapMath | undefined {
  const name = !pool ? '' : typeof pool == 'string' ? pool : pool.name
  const math = useSelector<AppState, StableSwapMath>((state) => state.stablePools.pools[name]?.math)
  return math
}

export function usePool(): readonly [StableSwapPool] {
  const [tok1, tok2] = useSelector<AppState, [string, string]>((state) => [
    state.swap.INPUT.currencyId,
    state.swap.OUTPUT.currencyId,
  ])
  return useCurrentPool(tok1, tok2)
}
