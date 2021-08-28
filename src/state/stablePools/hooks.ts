// To-Do: Implement Hooks to update Client-Side contract representation
import { useSelector } from 'react-redux'

import { StableSwapMath } from '../../utils/stableSwapMath'
import { AppState } from '..'
import { StableSwapPool } from './reducer'

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
