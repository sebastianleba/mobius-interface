import { JSBI, Token, TokenAmount } from '@ubeswap/sdk'
// Hooks
import { MentoConstants } from 'state/mentoPools/reducer'
import { StableSwapConstants } from 'state/stablePools/reducer'

import { MENTO_POOL_INFO, STATIC_POOL_INFO } from '../../constants/StablePools'
import { useActiveContractKit } from '../../hooks'
import { tryParseAmount } from '../swap/hooks'

export function useTokensTradeable(
  mento: boolean,
  tokenIn: Token | null | undefined
): readonly [{ [address: string]: Token }] {
  const tradeable: { [address: string]: Token } = {}
  const poolMap: { [name: string]: StableSwapConstants } = {}
  const pools: StableSwapConstants[][] | MentoConstants[][] = mento ? MENTO_POOL_INFO : STATIC_POOL_INFO
  const { chainId } = useActiveContractKit()

  if (!tokenIn) return [{}]

  if (!mento) pools[chainId].forEach((pool: StableSwapConstants) => (poolMap[pool.name] = pool))

  pools[chainId]
    .map((pool) => {
      if (!pool.metaPool) return pool
      return {
        ...pool,
        tokens: poolMap[pool.metaPool]?.tokens.concat(pool.tokens),
      }
    })
    .filter(
      ({ tokens, disabled }) =>
        tokens
          .filter(({ name }) => name !== 'Mob LP')
          .map(({ address }) => address)
          .includes(tokenIn.address) && !disabled
    )
    .flatMap(({ tokens }) => tokens)
    .forEach((token) => {
      if (token !== tokenIn) tradeable[token.address] = token
    })

  return [tradeable]
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: TokenAmount
  error?: string
} {
  const { account } = useActiveContractKit()

  const parsedInput: TokenAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error,
  }
}
