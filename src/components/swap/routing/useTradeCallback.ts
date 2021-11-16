import { useActiveContractKit } from 'hooks'
import { SwapCallbackState, useSwapCallback } from 'hooks/useSwapCallback'
import { useMemo } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE } from '../../../constants'
import { MobiusTrade } from '../../../state/swap/hooks'

/**
 * Use callback to allow trading
 * @param trade
 * @param allowedSlippage
 * @param recipientAddressOrName
 * @returns
 */
export const useTradeCallback = (
  trade: MobiusTrade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } => {
  const { library, account } = useActiveContractKit()

  const { state: swapState, callback: swapCallback, error } = useSwapCallback(trade, allowedSlippage)

  return useMemo(() => {
    if (error) {
      return { state: swapState, callback: null, error }
    }

    if (!library || !trade || !account) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }

    if (swapCallback) {
      return { state: SwapCallbackState.VALID, callback: swapCallback, error: null }
    } else {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Unknown trade type' }
    }
  }, [swapCallback, library, trade, account, error, swapState])
}
