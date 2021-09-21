import { useContractKit, useProvider } from '@celo-tools/use-contractkit'

export function useActiveContractKit() {
  //const context = useWeb3ReactCore<Web3Provider>()
  const kit = useContractKit()
  const {
    address: account,
    network: { chainId },
  } = kit
  const library = useProvider()
  return {
    ...kit,
    account,
    library,
    chainId,
  }
}

export function useChainId(): number | undefined {
  const {
    network: { chainId },
  } = useContractKit()
  return chainId
}
