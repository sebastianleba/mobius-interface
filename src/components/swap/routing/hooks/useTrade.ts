import { currencyEquals, Percent, Price, Token, TokenAmount, Trade, TradeType } from '@ubeswap/sdk'
import { UBESWAP_MOOLA_ROUTER_ADDRESS } from 'constants/index'

import { TradeRouter, UbeswapTrade } from '../trade'

const moolaRouter: TradeRouter = {
  routerAddress: UBESWAP_MOOLA_ROUTER_ADDRESS,
}

export class MoolaRouterTrade extends UbeswapTrade {
  inputAmount: TokenAmount
  outputAmount: TokenAmount
  executionPrice: Price
  /**
   *
   * @param originalTokenIn If null, the original token is the path token
   * @param originalTokenOut If null, the original token is the path token
   * @param innerTrade
   */
  constructor(
    public readonly originalTokenIn: Token | null,
    public readonly originalTokenOut: Token | null,
    public readonly innerTrade: Trade
  ) {
    super(
      innerTrade.route,
      innerTrade.tradeType === TradeType.EXACT_INPUT ? innerTrade.inputAmount : innerTrade.outputAmount,
      innerTrade.tradeType,
      moolaRouter,
      [
        ...(originalTokenIn ? [originalTokenIn] : []),
        ...innerTrade.route.path,
        ...(originalTokenOut ? [originalTokenOut] : []),
      ]
    )
    this.inputAmount = new TokenAmount(originalTokenIn ?? innerTrade.inputAmount.token, innerTrade.inputAmount.raw)
    this.outputAmount = new TokenAmount(originalTokenOut ?? innerTrade.outputAmount.token, innerTrade.outputAmount.raw)
    const baseIsInput = currencyEquals(innerTrade.executionPrice.baseCurrency, innerTrade.inputAmount.token)
    this.executionPrice = new Price(
      baseIsInput ? this.inputAmount.token : this.outputAmount.token,
      !baseIsInput ? this.inputAmount.token : this.outputAmount.token,
      innerTrade.executionPrice.denominator,
      innerTrade.executionPrice.numerator
    )
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  minimumAmountOut(slippageTolerance: Percent): TokenAmount {
    const amt = this.innerTrade.minimumAmountOut(slippageTolerance)
    return new TokenAmount(this.originalTokenOut ?? amt.token, amt.raw)
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  maximumAmountIn(slippageTolerance: Percent): TokenAmount {
    const amt = this.innerTrade.maximumAmountIn(slippageTolerance)
    return new TokenAmount(this.originalTokenIn ?? amt.token, amt.raw)
  }
}

/**
 * Converts the trade to a Moola Router trade, if the original tokens are lost
 * @param originalTokenIn
 * @param originalTokenOut
 * @param trade
 * @returns
 */
const convertToMoolaRouterTradeIfApplicable = (
  originalTokenIn: Token,
  originalTokenOut: Token,
  trade: UbeswapTrade
): UbeswapTrade => {
  const inUnchanged = trade.inputAmount.token.address === originalTokenIn.address
  const outUnchanged = trade.outputAmount.token.address === originalTokenOut.address
  if (inUnchanged && outUnchanged) {
    return trade
  }
  return new MoolaRouterTrade(inUnchanged ? originalTokenIn : null, outUnchanged ? originalTokenOut : null, trade)
}
