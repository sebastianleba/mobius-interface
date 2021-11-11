import { gql, useQuery } from '@apollo/client'
import { useContractKit, useProvider } from '@celo-tools/use-contractkit'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { addPrices, btcEthPrice, updateBlockNumber } from './actions'

const fetchEthBtcPrices = async (dispatch: any) => {
  const resp = await axios.get(
    'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599%2C0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&vs_currencies=usd'
  )
  const btcPrice: string = resp.data['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599']?.['usd']
  const ethPrice: string = resp.data['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']?.['usd']
  dispatch(btcEthPrice({ btcPrice: parseInt(btcPrice).toFixed(0), ethPrice: parseInt(ethPrice).toFixed(0) }))
}
// 0x17700282592d6917f6a73d0bf8accf4d578c131e

export function PriceData(): null {
  const graphQl = gql`
    {
      tokens(where: { derivedCUSD_gt: "0" }) {
        id
        derivedCUSD
      }
    }
  `
  const dispatch = useDispatch()
  const { data, loading, error } = useQuery(graphQl)
  useEffect(() => {
    if (!loading && !error && data) {
      console.log(data)
      const prices: { [address: string]: string } = data.tokens.reduce(
        (accum, cur) => ({ ...accum, [cur.id.toLowerCase()]: cur.derivedCUSD }),
        {}
      )

      dispatch(addPrices({ prices }))
    }
  }, [data, loading])
  return null
}

export default function Updater(): null {
  const library = useProvider()
  const { network } = useContractKit()
  const chainId = network.chainId
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null,
  })
  fetchEthBtcPrices(dispatch)

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    library.on('block', blockNumberCallback)
    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
