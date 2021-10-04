import { BigNumber } from '@ethersproject/bignumber'
import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { UBE } from 'constants/tokens'
import { useActiveContractKit } from 'hooks/index'
import { useMobiContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

// Addresses that do not contribute to circulating supply

const nonCirculatingAddresses = {
  Treasury: '0x16E319d8dAFeF25AAcec0dF0f1E349819D36993c',
  Airdrop: '0x74Fc71eF736feeaCfd58aeb2543c5fe4d33aDc14',
  Founder: '0x34deFd314fa23821a87FCbF5393311Bc5B7608C1',
  Investor: '0x5498248EaB20ff314bC465268920B48eed4Cdb7C',
  Advisor: '0x54Bf52862E1Fdf0D43D9B19Abb5ec72acA0a25A6',
  Voting: '0xd813a846aA9D572140d7ABBB4eFaC8cD786b4c0E',
}

/**
 * Fetches the circulating supply
 */
export const useCirculatingSupply = (): TokenAmount | undefined => {
  const { chainId } = useActiveContractKit()
  const mobi = chainId ? UBE[chainId] : undefined
  const mobiContract = useMobiContract()

  // compute amount that is locked up
  const balancesRaw = useSingleContractMultipleData(
    mobiContract,
    'balanceOf',
    Object.values(nonCirculatingAddresses).map((addr) => [addr])
  )

  const [available, setAvailable] = useState<BigNumber | null>(null)
  useEffect(() => {
    void (async () => {
      setAvailable((await mobiContract?.available_supply())!)
    })()
  }, [mobiContract])

  console.log(available?.toString())

  // if we are still loading, do not load
  const balances = balancesRaw?.find((result) => !result.result)
    ? null
    : (balancesRaw.map((b) => b.result?.[0] ?? BigNumber.from(0)) as readonly BigNumber[])
  const lockedBalancesSum = balances?.reduce((sum, b) => b.add(sum), BigNumber.from(0))

  if (!lockedBalancesSum || !available) {
    return undefined
  }
  return mobi ? new TokenAmount(mobi, JSBI.subtract(JSBI.BigInt(available), JSBI.BigInt(lockedBalancesSum))) : undefined
}
