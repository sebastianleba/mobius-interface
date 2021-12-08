// To-Do: Implement Hooks to update Client-Side contract representation
import { Token, TokenAmount } from '@ubeswap/sdk'
import { useSelector } from 'react-redux'

import { AppState } from '..'
import { ConstantSumPool } from './reducer'

export interface MentoPoolInfo {
  readonly poolAddress?: string
  readonly tokens: readonly Token[]
  readonly balances: TokenAmount[]
}

export function useCurrentOpenPool(tok1: string, tok2: string): ConstantSumPool | null {
  const pools = useSelector<AppState, ConstantSumPool[]>((state) =>
    state.openSum.pools.filter((pool) => {
      const tokenAddresses = pool.tokens.map((x) => x.address)
      return tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2)
    })
  )
  return pools.length > 0 ? pools[0] : null
}

export function useOpenPools(): readonly ConstantSumPool[] {
  const pools = useSelector<AppState, ConstantSumPool[]>((state) => state.openSum.pools)
  return pools
}
