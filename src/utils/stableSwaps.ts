import { Token } from '@ubeswap/sdk'

export type SwappableToken = Token & {
  swapAddress: string
}

export type StablePool = {
  token0: Token
  token1: Token
  token2: Token
}

// export const getSwappableTokens(tokenIn: Token):  SwappableToken[]{
//     const defaultTokens = useDefaultTokens();
// }
