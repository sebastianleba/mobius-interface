import { ChainId, Token } from '@ubeswap/sdk'
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import sortByListPriority from 'utils/listSort'

import { AppState } from '../index'
import { UNSUPPORTED_LIST_URLS } from './../../constants/lists'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

export const StableTokens: TokenList = {
  name: 'Mobius',
  timestamp: '2021-08-10T17:02:02.069Z',
  tokens: [
    {
      chainId: ChainId.ALFAJORES,
      address: '0x7588110A070987ea0347Cf788226c28d1476d641',
      decimals: 18,
      symbol: 'cUSD',
      name: 'Celo Dollar',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x17Ec8dab839a9880D656c3cEF40cf4038657d168',
      decimals: 18,
      symbol: 'USDT',
      name: 'Tether',
      logoURI: 'https://bit.ly/3AMrCyD',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0xCC531BfBA46cA251D3D9f3aCc37ABD5DCF3ed0B3',
      decimals: 18,
      symbol: 'USDC',
      name: 'US Dollar Coin',
      logoURI: 'https://bit.ly/3CwGimW',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x2AaF20d89277BF024F463749045964D7e7d3A774',
      decimals: 18,
      symbol: 'cTC1',
      name: 'Test Coin 1',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_sCELO.png',
    },
    {
      chainId: ChainId.ALFAJORES,
      address: '0x3551d53C9CF91E222D9579A1Ac4B44117E8Ec609',
      decimals: 18,
      symbol: 'cTC2',
      name: 'Test Coin 2',
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_rCELO.png',
    },
  ],
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
}

// DEFAULT_TOKEN_LIST.tokens = DEFAULT_TOKEN_LIST.tokens.concat([
//   {
//     address: '0x695218A22c805Bab9C6941546CF5395F169Ad871',
//     name: 'USD Coin',
//     symbol: 'cUSDC',
//     chainId: ChainId.MAINNET,
//     decimals: 18,
//     logoURI: 'https://bit.ly/3CwGimW',
//   },
//   {
//     address: '0x4DA9471c101e0cac906E52DF4f00943b21863efF',
//     name: 'Tether',
//     symbol: 'cUSDT',
//     chainId: ChainId.MAINNET,
//     decimals: 18,
//     logoURI: 'https://bit.ly/3AMrCyD',
//   },
// {
//   address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
//   name: 'Celo Dollar',
//   symbol: 'cUSD',
//   chainId: ChainId.MAINNET,
//   decimals: 18,
//   logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
// },
// ])

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{
  [chainId: number]: Readonly<{
    [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList }
  }>
}>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MAINNET]: {},
  [ChainId.ALFAJORES]: {},
  [ChainId.BAKLAVA]: {},
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (!list.tags?.[tagId]) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []
      const token = new WrappedTokenInfo(tokenInfo, tags)
      if (tokenMap[token.chainId]?.[token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: {
            token,
            list: list,
          },
        },
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  return useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl)
}

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return {
    [ChainId.MAINNET]: { ...map1[ChainId.MAINNET], ...map2[ChainId.MAINNET] },
    [ChainId.ALFAJORES]: { ...map1[ChainId.ALFAJORES], ...map2[ChainId.ALFAJORES] },
    [ChainId.BAKLAVA]: { ...map1[ChainId.BAKLAVA], ...map2[ChainId.BAKLAVA] },
  }
}

// merge tokens contained within lists from urls
function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists()

  return useMemo(() => {
    if (!urls) return EMPTY_LIST

    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            const newTokens = Object.assign(listToTokenMap(current))
            return combineMaps(allTokens, newTokens)
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, EMPTY_LIST)
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>((state) => state.lists.activeListUrls)?.filter(
    (url) => !UNSUPPORTED_LIST_URLS.includes(url)
  )
}

export function useInactiveListUrls(): string[] {
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter((url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url))
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  const defaultTokenMap = listToTokenMap(StableTokens)
  return combineMaps(activeTokens, defaultTokenMap)
}

// all tokens from inactive lists
export function useCombinedInactiveList(): TokenAddressMap {
  const allInactiveListUrls: string[] = useInactiveListUrls()
  return useCombinedTokenMapFromUrls(allInactiveListUrls)
}

// used to hide warnings on import for default tokens
export function useDefaultTokenList(): TokenAddressMap {
  return listToTokenMap(StableTokens)
}

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS)

  // format into one token address map
  return loadedUnsupportedListMap
}

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}
