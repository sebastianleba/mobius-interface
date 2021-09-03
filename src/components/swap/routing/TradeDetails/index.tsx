import React from 'react'
import { MobiusTrade } from 'state/swap/hooks'

import { describeTrade } from '../describeTrade'
import { MobiusTradeDetails } from './MobiusTradeDetails'

interface Props {
  trade: MobiusTrade
  allowedSlippage: number
}

export const TradeDetails: React.FC<Props> = ({ trade, allowedSlippage }: Props) => {
  const { routingMethod } = describeTrade(trade)

  return <MobiusTradeDetails trade={trade} allowedSlippage={allowedSlippage} />
}
