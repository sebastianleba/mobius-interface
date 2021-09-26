import { CeloContract, StableToken } from '@celo/contractkit'
import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'

import { MENTO_POOL_INFO } from '../../constants/StablePools'
import { useActiveContractKit } from '../../hooks'
import { UseMentoContract } from '../../hooks/useContract'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { MentoConstants } from './reducer'

export function UpdateMento(): null {
  const { library, chainId, account, kit } = useActiveContractKit()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: MentoConstants[] = MENTO_POOL_INFO[chainId]

  useEffect(() => {
    const updatePool = async (poolInfo: MentoConstants, stable: StableToken | undefined) => {
      try {
        let address: string
        if (stable === StableToken.cUSD) {
          address = await kit.registry.addressFor(CeloContract.Exchange)
        } else {
          address = await kit.registry.addressFor(CeloContract.ExchangeEUR)
        }
        const contract = UseMentoContract(address)
        if (!contract) return
        const balances = (await contract.getBuyAndSellBuckets(false)).map((x) => JSBI.BigInt(x))
        const swapFee = JSBI.BigInt(await contract.spread())
        dispatch(
          initPool({
            address: address,
            pool: {
              ...poolInfo,
              balances,
              address,
              swapFee,
            },
          })
        )
      } catch (error) {
        console.error(error)
      }
    }
    pools.forEach((pool) => {
      updatePool(pool, pool.stable)
    })
  }, [blockNumber, library, account, dispatch, pools, kit.contracts])

  return null
}
