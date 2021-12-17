import { ErrorBoundary } from '@sentry/react'
import { cUSD, JSBI, TokenAmount } from '@ubeswap/sdk'
import { Chain, Coins, PRICE } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import React from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { useCUSDPrice } from 'utils/useCUSDPrice'

import { AutoColumn } from '../../components/Column'
import { StablePoolCard } from '../../components/earn/StablePoolCard'
import Loader from '../../components/Loader'
import { Row } from '../../components/Row'
import { StablePoolInfo, useStablePoolInfo } from '../../state/stablePools/hooks'
import { Sel, TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin-top: 3rem;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  align-items: center;
`

export default function Pool() {
  const { chainId } = useActiveContractKit()

  const stablePools = useStablePoolInfo()

  const [selection, setSelection] = React.useState<Chain>(Chain.All)

  const tvl = stablePools
    .filter((pool) => pool && pool.virtualPrice)
    .reduce((accum, poolInfo) => {
      const price =
        poolInfo.poolAddress === '0x19260b9b573569dDB105780176547875fE9fedA3'
          ? JSBI.BigInt(PRICE[Coins.Bitcoin])
          : poolInfo.poolAddress === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'
          ? JSBI.BigInt(PRICE[Coins.Ether])
          : JSBI.BigInt(PRICE[Coins.USD])
      const lpPrice = JSBI.divide(
        JSBI.multiply(price, poolInfo.virtualPrice),
        JSBI.exponentiate(JSBI.BigInt('10'), JSBI.BigInt('18'))
      )
      const priceDeposited = JSBI.multiply(poolInfo?.totalDeposited?.raw ?? JSBI.BigInt('0'), lpPrice)
      return JSBI.add(accum, priceDeposited)
    }, JSBI.BigInt('0'))
  const tvlAsTokenAmount = new TokenAmount(cUSD[chainId], tvl)
  const mobiprice = useCUSDPrice(useMobi())

  const sortCallback = (pool1: StablePoolInfo, pool2: StablePoolInfo) => {
    if (!pool1 || !pool2) return true
    const isStaking1 = pool1.amountDeposited?.greaterThan(JSBI.BigInt('0')) || pool1.stakedAmount.greaterThan('0')
    const isStaking2 = pool2.amountDeposited?.greaterThan(JSBI.BigInt('0')) || pool2.stakedAmount.greaterThan('0')
    if (isStaking1 && !isStaking2) return false
    return true
  }

  return (
    <PageWrapper gap="lg" justify="center" style={{ marginTop: isMobile ? '-1rem' : '3rem' }}>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        <TYPE.tvlHeader>TVL: ${tvlAsTokenAmount.toFixed(0, { groupSeparator: ',' })}</TYPE.tvlHeader>
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        {mobiprice && <TYPE.price opacity={'.8'}>Latest MOBI Price: ${mobiprice.toFixed(3)}</TYPE.price>}
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <HeaderLinks>
          <Sel onClick={() => setSelection(Chain.All)} selected={selection === Chain.All}>
            ALL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Celo)} selected={selection === Chain.Celo}>
            CELO
          </Sel>
          <Sel onClick={() => setSelection(Chain.Ethereum)} selected={selection === Chain.Ethereum}>
            ETH
          </Sel>
          <Sel onClick={() => setSelection(Chain.Polygon)} selected={selection === Chain.Polygon}>
            POLY
          </Sel>
          <Sel onClick={() => setSelection(Chain.Solana)} selected={selection === Chain.Solana}>
            SOL
          </Sel>
          <Sel onClick={() => setSelection(Chain.Avax)} selected={selection === Chain.Avax}>
            AVAX
          </Sel>
        </HeaderLinks>
        <PoolSection>
          {stablePools && stablePools?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : (
            stablePools
              ?.sort(sortCallback)
              .filter((pool) => selection === Chain.All || selection === pool.displayChain)
              .map((pool) => (
                <ErrorBoundary key={pool.poolAddress || '000'}>
                  <StablePoolCard poolInfo={pool} />
                </ErrorBoundary>
              ))
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
