// To-Do: Implement Hooks to update Client-Side contract representation
import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useSwappableTokens } from 'hooks/Tokens'
import { useStableSwapContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

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
  readonly apr?: TokenAmount
  readonly totalStakedAmount: TokenAmount
  readonly stakedAmount: TokenAmount
  readonly totalVolume?: TokenAmount
  readonly peggedTo: string
  readonly virtualPrice: TokenAmount
  readonly priceOfStaked: TokenAmount
  readonly usersBalance: TokenAmount[]
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

export function useStablePoolInfo(): readonly StablePoolInfo[] {
  const pools = usePools()
  const tokens = useSwappableTokens()
  return pools.map((pool) => ({
    name: pool.name,
    poolAddress: pool.address,
    lpToken: pool.lpToken,
    tokens: pool.tokenAddresses.map((address) => tokens[address]),
    amountDeposited: new TokenAmount(pool.lpToken, pool.lpOwned),
    totalStakedAmount: new TokenAmount(pool.lpToken, pool.lpTotalSupply),
    stakedAmount: new TokenAmount(pool.lpToken, pool.lpOwned),
    apr: new TokenAmount(pool.lpToken, JSBI.BigInt('100000000000')),
    peggedTo: pool.peggedTo,
    virtualPrice: tokenAmountScaled(pool.lpToken, JSBI.multiply(pool.virtualPrice, pool.lpTotalSupply)),
    priceOfStaked: tokenAmountScaled(pool.lpToken, JSBI.multiply(pool.virtualPrice, pool.lpOwned)),
    usersBalance: pool.tokenAddresses.map((address, i) => tokenAmountScaled(tokens[address], pool.balances[i])),
  }))
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
      const newTokenAmounts = await contract?.calculateRemoveLiquidity(account, lpAmount.raw.toString())
      setExpectedOut(tokens.map((token, i) => new TokenAmount(token, JSBI.BigInt(newTokenAmounts[i].toString()))))
    }
    updateData()
  }, [account, pool, lpAmount])
  return expectedOut
}

export function useExpectedLpTokens(pool: StablePoolInfo, tokenAmounts: TokenAmount[]): TokenAmount {
  const contract = useStableSwapContract(pool.poolAddress)
  const { account } = useActiveWeb3React()
  const [expectedOut, setExpectedOut] = useState(new TokenAmount(pool.lpToken, JSBI.BigInt('0')))
  useEffect(() => {
    const updateData = async () => {
      const newExpected = await contract?.calculateTokenAmount(
        account,
        tokenAmounts.map((t) => BigInt(t.raw.toString())),
        true,
        { gasLimit: 350000 }
      )
      setExpectedOut(new TokenAmount(pool.lpToken, JSBI.BigInt(newExpected?.toString() || '0')))
    }
    updateData()
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
