import { Route, Token, TokenAmount, Trade, TradeType } from '@ubeswap/sdk'

export interface TradeRouter {
  routerAddress?: string
}

export interface PoolLocation {
  poolAddress?: string
}

export class UbeswapTrade extends Trade {
  hidePairAnalytics = false
  router: TradeRouter
  readonly path: readonly Token[]

  constructor(route: Route, amount: TokenAmount, tradeType: TradeType, router: TradeRouter, path: readonly Token[]) {
    super(route, amount, tradeType)
    this.router = router
    this.path = path
  }

  static fromInnerTrade(innerTrade: Trade, router: TradeRouter, path: readonly Token[]) {
    return new UbeswapTrade(
      innerTrade.route,
      innerTrade.tradeType === TradeType.EXACT_INPUT ? innerTrade.inputAmount : innerTrade.outputAmount,
      innerTrade.tradeType,
      router,
      path
    )
  }

  static fromNormalTrade(trade: Trade): UbeswapTrade {
    return UbeswapTrade.fromInnerTrade(trade, null, trade.route.path)
  }
}

export class MobiusTrade extends UbeswapTrade {
  hidePairAnalytics = false
  pool: PoolLocation

  constructor(route: Route, amount: TokenAmount, tradeType: TradeType, pool: PoolLocation, pair: readonly Token[]) {
    super(null, amount, tradeType, null, pair)
    this.pool = pool
  }
}
