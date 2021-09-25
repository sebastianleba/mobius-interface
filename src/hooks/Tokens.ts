import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { Token } from '@ubeswap/sdk'
import { useMemo } from 'react'

import { filterTokens } from '../components/SearchModal/filtering'
import { MOBI_TOKEN, STATIC_POOL_INFO, VOTING_ESCROW } from '../constants/StablePools'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { isAddress } from '../utils'
import { TokenAddressMap } from './../state/lists/hooks'
import { useActiveContractKit } from './index'
import { useBytes32TokenContract, useTokenContract } from './useContract'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean): { [address: string]: Token } {
  const { chainId } = useActiveContractKit()
  console.log(chainId)

  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{ [address: string]: Token }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})

    return mapWithoutUrls
  }, [chainId, tokenMap, includeUserAdded])
}

export function useSwappableTokens(): { [address: string]: Token } {
  const { chainId } = useActiveContractKit()
  const pools = STATIC_POOL_INFO[chainId] ?? []
  const swappableTokens: { [address: string]: Token } = {}

  pools
    .flatMap(({ tokens }) => tokens)
    .forEach((token) => {
      if (swappableTokens[token.address]) return
      swappableTokens[token.address] = token
    })
  return swappableTokens
}

export function useDefaultTokens(): { [address: string]: Token } {
  return {}
}

export function useAllTokens(): { [address: string]: Token } {
  return {}
}

export function useAllInactiveTokens(): { [address: string]: Token } {
  return {}
}

export function useUnsupportedTokens(): { [address: string]: Token } {
  return {}
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllTokens()

  if (!activeTokens || !token) {
    return false
  }

  return !!activeTokens[token.address]
}

// used to detect extra search results
export function useFoundOnInactiveList(searchQuery: string): Token[] | undefined {
  const { chainId } = useActiveContractKit()
  const inactiveTokens = useAllInactiveTokens()

  return useMemo(() => {
    if (!chainId || searchQuery === '') {
      return undefined
    } else {
      const tokens = filterTokens(Object.values(inactiveTokens), searchQuery)
      return tokens
    }
  }, [chainId, inactiveTokens, searchQuery])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Token | undefined | null): boolean {
  if (!currency) {
    return false
  }

  return false
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveContractKit()
  const tokens = useSwappableTokens()

  const address = isAddress(tokenAddress)

  const tokenContract = useTokenContract(address ? address : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
  const token: Token | undefined = address ? tokens[address] : undefined

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD
  )
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals.result) {
      return new Token(
        chainId as number,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
      )
    }
    return undefined
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ])
}

export function useCurrency(currencyId: string | undefined): Token | null | undefined {
  const token = useToken(currencyId)
  return token
}

export function useMobi(): Token | undefined {
  const { chainId } = useActiveContractKit()
  return MOBI_TOKEN[chainId]
}

export function useVeMobi(): Token | undefined {
  const { chainId } = useActiveContractKit()
  return new Token(chainId, VOTING_ESCROW, 18)
}
