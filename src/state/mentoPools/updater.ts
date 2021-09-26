import { ExchangeWrapper } from '@celo/contractkit/lib/wrappers/Exchange'
import { JSBI } from '@ubeswap/sdk'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBlockNumber } from 'state/application/hooks'

import { MENTO_POOL_INFO } from '../../constants/StablePools'
import { useActiveContractKit } from '../../hooks'
import { AppDispatch } from '../index'
import { initPool } from './actions'
import { MentoConstants } from './reducer'

export function UpdateMento(): null {
  const { library, chainId, account, kit } = useActiveContractKit()
  const blockNumber = useBlockNumber()
  const dispatch = useDispatch<AppDispatch>()
  const pools: MentoConstants[] = MENTO_POOL_INFO[chainId]

  useEffect(() => {
    const updatePool = async (poolInfo: MentoConstants, contract: ExchangeWrapper | undefined) => {
      if (!contract) return

      try {
        const balances = (await contract.getBuyAndSellBuckets(false)).map((num) => JSBI.BigInt(num))

        dispatch(
          initPool({
            address: poolInfo.address,
            pool: {
              ...poolInfo,
              balances,
            },
          })
        )
      } catch (error) {
        console.error(error)
      }
    }
    console.log('in update')
    pools.forEach(async (pool) => {
      updatePool(pool, await kit.contracts.getExchange(pool.stable))
    })
  }, [blockNumber, library, account, dispatch, pools, kit.contracts])

  return null
}
