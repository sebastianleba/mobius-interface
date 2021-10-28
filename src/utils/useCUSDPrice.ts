import { useContractKit } from '@celo-tools/use-contractkit'
import { CELO, ChainId as UbeswapChainId, currencyEquals, cUSD, Fraction, Price, Token } from '@ubeswap/sdk'
import { useMemo } from 'react'

import { usePairs } from '../data/Reserves'
import { useTokenPrice } from '../state/application/hooks'

type TokenPair = [Token | undefined, Token | undefined]

/**
 * Returns the price in cUSD of the input currency
 * @param currency currency to compute the cUSD price of
 */
export function useCUSDPrice(tokens?: Token[] | Token): Price | undefined {
  const {
    network: { chainId },
  } = useContractKit()
  if (tokens instanceof Token) {
    tokens = [tokens]
  }
  const CUSD = cUSD[chainId as unknown as UbeswapChainId]

  const p1 = useTokenPrice(tokens?.[0]?.address)
  const p2 = useTokenPrice(tokens?.[1]?.address)
  return p1
    ? new Price(tokens?.[0], CUSD, p1.denominator, p1.numerator)
    : p2
    ? new Price(tokens?.[1], CUSD, p2.denominator, p2.numerator)
    : undefined

  // const CUSD = cUSD[chainId as unknown as UbeswapChainId]
  // const celo = CELO[chainId as unknown as UbeswapChainId]
  // const tokenPairs: TokenPair[] = useMemo(
  //   () =>
  //     tokens
  //       ?.map((token) => [
  //         [token && currencyEquals(token, CUSD) ? undefined : token, CUSD],
  //         [token && currencyEquals(token, celo) ? undefined : token, celo],
  //         [celo, CUSD],
  //       ])
  //       .flat() as TokenPair[],
  //   [CUSD, celo, tokens]
  // )
  // const pairs = usePairs(tokenPairs).map((x) => x[1])

  // return useMemo(() => {
  //   if (!tokens || !chainId) {
  //     return undefined
  //   }

  //   const prices = tokens.map((token, idx) => {
  //     const start = idx * 3
  //     const [cUSDPair, celoPair, celoCUSDPair] = [pairs[start], pairs[start + 1], pairs[start + 2]]

  //     // handle cUSD
  //     if (token.equals(CUSD)) {
  //       return new Price(CUSD, CUSD, '1', '1')
  //     }
  //     let price: Price | undefined = undefined

  //     if (celoPair && celoCUSDPair) {
  //       price = celoPair.priceOf(token).multiply(celoCUSDPair.priceOf(celo))
  //     }

  //     if (cUSDPair) {
  //       const newPrice = cUSDPair.priceOf(token)
  //       price = !price || newPrice.greaterThan(new Fraction(price.numerator, price.denominator)) ? newPrice : price
  //     }

  //     return price
  //   })
  //   return prices.filter((p: Price | undefined) => !p)[0] ?? undefined
  // }, [chainId, tokens, CUSD, celo, pairs])
}

/**
 * Returns the price in cUSD of the input currency
 * @param currency currency to compute the cUSD price of
 */
export function _useCUSDPrice(token?: Token): Price | undefined {
  const {
    network: { chainId },
  } = useContractKit()
  const CUSD = cUSD[chainId as unknown as UbeswapChainId]
  const celo = CELO[chainId as unknown as UbeswapChainId]
  const tokenPairs: [Token | undefined, Token | undefined][] = useMemo(
    () => [
      [token && currencyEquals(token, CUSD) ? undefined : token, CUSD],
      [token && currencyEquals(token, celo) ? undefined : token, celo],
      [celo, CUSD],
    ],
    [CUSD, celo, token]
  )
  const [[, cUSDPair], [, celoPair], [, celoCUSDPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!token || !chainId) {
      return undefined
    }

    // handle cUSD
    if (token.equals(CUSD)) {
      return new Price(CUSD, CUSD, '1', '1')
    }

    let price: Price | undefined = undefined

    if (celoPair && celoCUSDPair) {
      price = celoPair.priceOf(token).multiply(celoCUSDPair.priceOf(celo))
    }

    if (cUSDPair) {
      const newPrice = cUSDPair.priceOf(token)
      price = !price || newPrice.greaterThan(new Fraction(price.numerator, price.denominator)) ? newPrice : price
    }

    return price
  }, [chainId, token, CUSD, cUSDPair, celo, celoCUSDPair, celoPair])
}
