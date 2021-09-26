import { MentoTrade } from 'state/mento/hooks'
import { MobiusTrade } from 'state/swap/hooks'

export enum RoutingMethod {
  UBESWAP = 0,
  MOOLA = 1,
  MOOLA_ROUTER = 2,
  MOBIUS = 3,
}

export const describeTrade = (
  trade: MobiusTrade | MentoTrade | undefined
): {
  label: string
  makeLabel: (isInverted: boolean) => string
  routingMethod: RoutingMethod
  isEstimate: boolean
} => {
  return {
    label: 'Swap',
    routingMethod: RoutingMethod.MOBIUS,
    isEstimate: true,
    makeLabel: () => 'Swap',
  }
}
