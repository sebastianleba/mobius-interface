import { Token } from '@ubeswap/sdk'
import { BridgeableTokens, OpticsDevDomains, OpticsDomainInfo, OpticsMainnetDomains } from 'constants/Optics'
import { useActiveContractKit, useChainId } from 'hooks'

export const useNetworkDomains = (): OpticsDomainInfo[] => {
  const { chainId } = useActiveContractKit()
  if (OpticsMainnetDomains.findIndex((domain) => domain.chainId === chainId) > -1) {
    return OpticsMainnetDomains
  }
  return OpticsDevDomains
}

export const useBridgeableTokens = (): { [address: string]: Token } => {
  const chainId = useChainId()
  const tokenList: Token[] = BridgeableTokens[chainId] as any as Token[]
  if (!chainId || chainId === -1) return null
  const tokenMap: { [address: string]: Token } = {}
  if (!tokenMap!) return null
  tokenList.forEach((token) => (tokenMap[token.address] = token))
  return tokenMap
}
