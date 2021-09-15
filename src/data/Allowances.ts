import { Token, TokenAmount } from '@ubeswap/sdk'
import { useEffect, useMemo, useState } from 'react'

import { useTokenContract } from '../hooks/useContract'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const [allowance, setAllowance] = useState<string>('')
  useEffect(() => {
    async function getAllowance() {
      const newAllowance = await contract?.allowance(owner, spender)
      setAllowance(newAllowance?.toString() ?? '0')
    }
    getAllowance()
  }, [token, allowance])
  // const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
