// To-Do: Implement Hooks to update Client-Side contract representation
import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
import { useSelector } from 'react-redux'

import { MentoMath } from '../../utils/mentoMath'
import { AppState } from '..'
import { MentoPool } from './reducer'

export interface MentoPoolInfo {
  readonly poolAddress?: string
  readonly tokens: readonly Token[]
  readonly balances: TokenAmount[]
}

export function useCurrentPool(tok1: string, tok2: string): readonly [MentoPool] {
  const pools = useSelector<AppState, MentoPool[]>((state) => {
    console.log(state.mentoPools.pools)
    return Object.values(state.mentoPools.pools)
      .map(({ pool }) => pool)
      .filter(({ tokenAddresses }) => {
        return tokenAddresses.includes(tok1) && tokenAddresses.includes(tok2)
      })
  })
  return [pools.length > 0 ? pools[0] : null]
}

export function usePools(): readonly MentoPool[] {
  const pools = useSelector<AppState, MentoPool[]>((state) =>
    Object.values(state.mentoPools.pools).map(({ pool }) => pool)
  )
  return pools
}

const tokenAmountScaled = (token: Token, amount: JSBI): TokenAmount =>
  new TokenAmount(token, JSBI.divide(amount, JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt(token.decimals))))

const getPoolInfo = (pool: MentoPool): MentoPoolInfo => ({
  poolAddress: pool.address,
  tokens: pool.tokens,
  balances: pool.tokens.map((token, i) => new TokenAmount(token, pool.balances[i])),
})

export function useMentoPoolInfoByName(name: string): MentoPoolInfo | undefined {
  const pool = useSelector<AppState, MentoPool>((state) => state.mentoPools.pools[name]?.pool)
  return !pool ? undefined : { ...getPoolInfo(pool) }
}

export function useMentoPoolInfo(): readonly MentoPoolInfo[] {
  const pools = usePools()
  return pools.map((pool) => getPoolInfo(pool))
}

export function useMathUtil(pool: MentoPool | string): MentoMath | undefined {
  const name = !pool ? '' : typeof pool == 'string' ? pool : pool.address
  const math = useSelector<AppState, MentoMath>((state) => state.mentoPools.pools[name]?.math)
  return math
}

export function usePool(): readonly [MentoPool] {
  const [tok1, tok2] = useSelector<AppState, [string, string]>((state) => [
    state.mento.INPUT.currencyId,
    state.mento.OUTPUT.currencyId,
  ])
  return useCurrentPool(tok1, tok2)
}
