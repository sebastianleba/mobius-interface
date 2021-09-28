export enum RoutingMethod {
  UBESWAP = 0,
  MOOLA = 1,
  MOOLA_ROUTER = 2,
  MOBIUS = 3,
}

export const describeTrade = (
  mento?: boolean
): {
  label: string
  makeLabel: (isInverted: boolean) => string
  routingMethod: RoutingMethod
  isEstimate: boolean
} => {
  let label = 'Swap'
  if (mento) {
    label = 'Mint'
  }
  return {
    label: label,
    routingMethod: RoutingMethod.MOBIUS,
    isEstimate: true,
    makeLabel: () => label,
  }
}
