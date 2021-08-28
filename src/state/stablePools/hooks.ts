// To-Do: Implement Hooks to update Client-Side contract representation
import { useSelector } from 'react-redux'

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

export function usePool(): readonly [StableSwapPool] {
  const [tok1, tok2] = useSelector<AppState, [string, string]>((state) => [
    state.swap.INPUT.currencyId,
    state.swap.OUTPUT.currencyId,
  ])
  return getCurrentPool(tok1, tok2)
}
