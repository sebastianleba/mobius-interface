import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { Token } from '@ubeswap/sdk'
import { useMemo } from 'react'

import { MENTO_POOL_INFO, MOBI_TOKEN, STATIC_POOL_INFO, veMOBI_TOKEN } from '../constants/StablePools'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { isAddress } from '../utils'
import { useActiveContractKit } from './index'
import { useBytes32TokenContract, useTokenContract } from './useContract'

export function useSwappableTokens(mento?: boolean): { [address: string]: Token } {
  const { chainId } = useActiveContractKit()
  const pools = mento ? MENTO_POOL_INFO[chainId] ?? [] : STATIC_POOL_INFO[chainId] ?? []
  const swappableTokens: { [address: string]: Token } = {}
  pools
    .flatMap(({ tokens }) => tokens)
    .forEach((token) => {
      if (swappableTokens[token.address] || token.name === 'Mob LP') return
      swappableTokens[token.address] = token
    })
  return swappableTokens
}

export function useAllTokens(): { [address: string]: Token } {
  return {}
}

export function useUnsupportedTokens(): { [address: string]: Token } {
  return {}
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
export function useToken(mento?: boolean, tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveContractKit()
  const tokens = useSwappableTokens(mento)

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

export function useCurrency(mento: boolean, currencyId: string | undefined): Token | null | undefined {
  const token = useToken(mento, currencyId)
  return token
}

export function useMobi(): Token | undefined {
  const { chainId } = useActiveContractKit()
  return MOBI_TOKEN[chainId]
}

export function useVeMobi(): Token | undefined {
  const { chainId } = useActiveContractKit()
  return veMOBI_TOKEN[chainId]
}
