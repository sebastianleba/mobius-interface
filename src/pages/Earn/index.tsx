import { ErrorBoundary } from '@sentry/react'
import { cUSD, JSBI, TokenAmount } from '@ubeswap/sdk'
import { Coins, PRICE } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useMobi } from 'hooks/Tokens'
import { partition } from 'lodash'
import React, { useMemo } from 'react'
import Countdown from 'react-countdown'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { useCUSDPrice } from 'utils/useCUSDPrice'

import { AutoColumn } from '../../components/Column'
import { PoolCard } from '../../components/earn/PoolCard'
import { StablePoolCard } from '../../components/earn/StablePoolCard'
import Loader from '../../components/Loader'
import { RowBetween } from '../../components/Row'
import { BIG_INT_ZERO } from '../../constants'
import { useStablePoolInfo } from '../../state/stablePools/hooks'
import { MOO_LP1, MOO_LP2, POOF_DUAL_LP, StakingInfo, useStakingInfo } from '../../state/stake/hooks'
import { TYPE } from '../../theme'
import { COUNTDOWN_END, LaunchCountdown } from './LaunchCountdown'

const StyledCountdown = styled(Countdown)`
  font-size: 3rem;
  text-align: center;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin-top: 3rem;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

// {stakedPools.length > 0 && (
//   <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
//     <DataRow style={{ alignItems: 'baseline' }}>
//       <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Your Pools</TYPE.mediumHeader>
//       <div>{/* TODO(igm): show TVL here */}</div>
//     </DataRow>

//     <PoolSection>
//       {stakedPools.map((pool) => (
//         <ErrorBoundary key={pool.stakingRewardAddress}>
//           <PoolCard stakingInfo={pool} />
//         </ErrorBoundary>
//       ))}
//     </PoolSection>
//   </AutoColumn>
// )}

export default function Earn() {
  // staking info for connected account
  const stakingInfos = useStakingInfo()
  const launchTime = new Date(Date.UTC(2021, 8, 19, 2))
  const now = new Date()
  const isLive = now >= launchTime
  const { chainId } = useActiveContractKit()

  // toggle copy if rewards are inactive
  const stakingRewardsExist = true

  const allPools = useMemo(
    () =>
      // Sort staking info by highest rewards
      stakingInfos?.slice().sort((a: StakingInfo, b: StakingInfo) => {
        return JSBI.toNumber(JSBI.subtract(b.totalRewardRate.raw, a.totalRewardRate.raw))
      }),
    [stakingInfos]
  )

  const [stakedPools, unstakedPools] = useMemo(() => {
    return partition(allPools, (pool) => pool.stakedAmount && JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  }, [allPools])

  const [activePools, inactivePools] = partition(unstakedPools, (pool) => pool.active)

  const isGenesisOver = COUNTDOWN_END < new Date().getTime()

  const poofUBELP = allPools.find((pool) => pool.stakingToken.address === POOF_DUAL_LP)
  const mcUSDmcEURLP = allPools.find((pool) => pool.stakingToken.address === MOO_LP1)
  const moomCELOLP = allPools.find((pool) => pool.stakingToken.address === MOO_LP2)

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

  const inactiveDisplay = inactivePools.length > 0 && (
    <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
      <DataRow style={{ alignItems: 'baseline' }}>
        <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Inactive Pools</TYPE.mediumHeader>
        <div>{/* TODO(igm): show TVL here */}</div>
      </DataRow>

      <PoolSection>
        {inactivePools.map((pool) => (
          <ErrorBoundary key={pool.stakingRewardAddress}>
            <PoolCard stakingInfo={pool} />
          </ErrorBoundary>
        ))}
      </PoolSection>
    </AutoColumn>
  )
  // {isGenesisOver && (
  //   <TopSection gap="md">
  //     <DataCard>
  //       <CardNoise />
  //       <CardSection>
  //         <AutoColumn gap="md">
  //           <RowBetween>
  //             <TYPE.white fontWeight={600}>Mobius liquidity mining</TYPE.white>
  //           </RowBetween>
  //           <RowBetween>
  //             <TYPE.white fontSize={14}>
  //               Provide Liquidity to receive LP Tokens and earn a chunk of fees from trades that route through the
  //               pool.
  //             </TYPE.white>
  //           </RowBetween>{' '}
  //           <ExternalLink
  //             style={{ color: 'white', textDecoration: 'underline' }}
  //             href="https://medium.com"
  //             target="_blank"
  //           >
  //             <TYPE.white fontSize={14}>Read more about MOBI</TYPE.white>
  //           </ExternalLink>
  //         </AutoColumn>
  //       </CardSection>
  //       <CardNoise />
  //     </DataCard>
  //   </TopSection>
  // )}

  // <DataRow style={{ alignItems: 'baseline' }}>
  //         <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Coming Soon!</TYPE.mediumHeader>
  //       </DataRow>
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
                <StablePoolCard poolInfo={pool} />
              </ErrorBoundary>
            ))
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
