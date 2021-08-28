// To-Do: Implement Hooks to update Client-Side contract representation
import { Token, TokenAmount } from '@ubeswap/sdk'
import { useSwappableTokens } from 'hooks/Tokens'
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
}

export function useCurrentPool(tok1: string, tok2: string): readonly [StableSwapPool] {
  const pools = useSelector<AppState, StableSwapPool[]>((state) =>
    Object.values(state.stablePools.pools)
      .map(({ pool }) => pool)
      .filter(({ tokenAddresses }) => tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2))
  )
  return [pools.length > 0 ? pools[0] : null]
}

export function usePools(): readonly StableSwapPool[] {
  const pools = useSelector<AppState, StableSwapPool[]>((state) =>
    Object.values(state.stablePools.pools).map(({ pool }) => pool)
  )
  return pools
}

export function useStablePoolInfo(): readonly StablePoolInfo[] {
  const pools = usePools()
  const tokens = useSwappableTokens()
  return pools.map((pool) => ({
    name: pool.name,
    poolAddress: pool.address,
    lpToken: pool.lpToken,
    tokens: pool.tokenAddresses.map((address) => tokens[address]),
    amountDeposited: new TokenAmount(pool.lpToken, pool.lpTotalSupply),
    totalStakedAmount: new TokenAmount(pool.lpToken, pool.lpTotalSupply),
    stakedAmount: new TokenAmount(pool.lpToken, pool.lpTotalSupply),
  }))
}

export function useMathUtil(pool: StableSwapPool | string): readonly [StableSwapMath] {
  const name = typeof pool == 'string' ? pool : pool.name
  const math = useSelector<AppState, StableSwapMath>((state) => state.stablePools.pools[name].math)
  return [math]
}

export function usePool(): readonly [StableSwapPool] {
  const [tok1, tok2] = useSelector<AppState, [string, string]>((state) => [
    state.swap.INPUT.currencyId,
    state.swap.OUTPUT.currencyId,
  ])
  return useCurrentPool(tok1, tok2)
}
