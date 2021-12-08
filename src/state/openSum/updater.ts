import { Interface } from '@ethersproject/abi'
import { JSBI } from '@ubeswap/sdk'
import { ConstantSum, ConstantSumInfo } from 'constants/ConstantSum'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useMultipleContractSingleData } from 'state/multicall/hooks'

import CONSTANT_SUM from '../../constants/abis/ConstantSum.json'
import { useActiveContractKit } from '../../hooks'
import { AppDispatch } from '../index'
import { BigIntToJSBI } from '../stablePools/updater'
import { updateBalances } from './actions'

const ConstantSumInterface = new Interface(CONSTANT_SUM.abi)
const ZERO = JSBI.BigInt('0')

export function UpdateOpenSum(): null {
  const { chainId } = useActiveContractKit()
  const dispatch = useDispatch<AppDispatch>()
  const pools: ConstantSumInfo[] = ConstantSum[chainId] ?? []

  const balancesMany = useMultipleContractSingleData(
    pools.map(({ address }) => address),
    ConstantSumInterface,
    'getBalances'
  )

  useMemo(() => {
    const balances = balancesMany?.map(
      ({ result }) => result?.map((n) => BigIntToJSBI(n as BigInt, '0')) ?? [ZERO, ZERO]
    )
    dispatch(updateBalances({ balances }))
  }, [dispatch, balancesMany])

  return null
}
