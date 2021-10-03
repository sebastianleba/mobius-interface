import React from 'react'
import { useLocation } from 'react-router'
import { MobiusTrade } from 'state/swap/hooks'

import { MobiusTradeDetails } from './MobiusTradeDetails'

interface Props {
  trade: MobiusTrade
  allowedSlippage: number
}

export const TradeDetails: React.FC<Props> = ({ trade, allowedSlippage }: Props) => {
  const location = useLocation()
  const mento = location.pathname.includes('mint')

  return <MobiusTradeDetails trade={trade} allowedSlippage={allowedSlippage} mento={mento} />
}
