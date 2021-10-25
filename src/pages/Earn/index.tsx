import { ErrorBoundary } from '@sentry/react'
import { cUSD, JSBI, TokenAmount } from '@ubeswap/sdk'
import { Coins, PRICE } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import React from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import useCUSDPrice from 'utils/useCUSDPrice'

import { AutoColumn } from '../../components/Column'
import { StablePoolCard } from '../../components/earn/StablePoolCard'
import Loader from '../../components/Loader'
import { useStablePoolInfo } from '../../state/stablePools/hooks'
import { TYPE } from '../../theme'
import { COUNTDOWN_END, LaunchCountdown } from './LaunchCountdown'

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

export default function Earn() {
  const { chainId } = useActiveContractKit()

  const isGenesisOver = COUNTDOWN_END < new Date().getTime()

  const stablePools = useStablePoolInfo()
  const sortedStablePools = stablePools

  const tvl = stablePools.reduce((accum, poolInfo) => {
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

  return (
    <PageWrapper gap="lg" justify="center" style={{ marginTop: isMobile ? '-1rem' : '3rem' }}>
      {!isGenesisOver && <LaunchCountdown />}
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        <TYPE.tvlHeader>TVL: ${tvlAsTokenAmount.toFixed(0, { groupSeparator: ',' })}</TYPE.tvlHeader>
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px', justifyContent: 'center', alignItems: 'center' }}>
        {mobiprice && <TYPE.price opacity={'.8'}>Latest MOBI Price: ${mobiprice.toFixed(3)}</TYPE.price>}
      </AutoColumn>
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <PoolSection>
          {sortedStablePools && sortedStablePools?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : (
            sortedStablePools?.map((pool) => (
              <ErrorBoundary key={pool.poolAddress || '000'}>
                {pool.name === 'Private Celo' && <StablePoolCard poolInfo={pool} />}
              </ErrorBoundary>
            ))
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
